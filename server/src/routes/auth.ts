import { Hono } from "hono";
import { z } from "zod";
import { prisma } from "../lib/db.js";
import { hashPin, signToken, verifyPin } from "../lib/auth.js";
import { generateInviteToken, pupilJoinUrl } from "../lib/invite.js";
import { isValidSchoolSlug, normalizeSchoolSlug } from "../lib/slug.js";
import { uniqueUsernameForSchool } from "../lib/username.js";

const loginSchema = z.object({
  schoolSlug: z.string().min(1),
  username: z.string().min(1),
  pin: z.string().min(4),
});

const registerSchoolSchema = z.object({
  schoolName: z.string().min(2).max(120),
  schoolSlug: z.string().min(3).max(48),
  city: z.string().min(2).max(80),
  postcode: z.string().min(3).max(12),
  adminFirstName: z.string().min(1).max(40),
  adminPin: z.string().min(4).max(6),
});

const registerPupilSchema = z.object({
  inviteToken: z.string().min(8),
  firstName: z.string().min(1).max(40),
  teamColour: z.enum(["RED", "BLUE"]),
  pin: z.string().min(4).max(6),
});

export const authRoutes = new Hono();

authRoutes.get("/invite/:token", async (c) => {
  const token = c.req.param("token").trim();
  const school = await prisma.school.findUnique({
    where: { inviteToken: token },
    select: { name: true, slug: true, city: true, postcode: true },
  });
  if (!school) {
    return c.json({ error: "This school link is not valid." }, 404);
  }
  return c.json({ school });
});

authRoutes.post("/register/school", async (c) => {
  const body = registerSchoolSchema.safeParse(await c.req.json());
  if (!body.success) {
    return c.json({ error: "Please complete all school details." }, 400);
  }

  const slug = normalizeSchoolSlug(body.data.schoolSlug);
  if (!isValidSchoolSlug(slug)) {
    return c.json(
      {
        error:
          "School code must be 3+ characters, lowercase letters, numbers, and hyphens only.",
      },
      400,
    );
  }

  const existing = await prisma.school.findUnique({ where: { slug } });
  if (existing) {
    return c.json({ error: "That school code is already taken. Try another." }, 409);
  }

  const inviteToken = generateInviteToken();
  const pinHash = await hashPin(body.data.adminPin);

  const school = await prisma.school.create({
    data: {
      name: body.data.schoolName.trim(),
      slug,
      city: body.data.city.trim(),
      postcode: body.data.postcode.trim().toUpperCase(),
      inviteToken,
    },
  });

  const admin = await prisma.user.create({
    data: {
      schoolId: school.id,
      role: "SCHOOL_ADMIN",
      username: "admin",
      pinHash,
      firstName: body.data.adminFirstName.trim(),
      accountStatus: "APPROVED",
      active: true,
      points: 0,
      level: "Getting started",
    },
  });

  const inviteUrl = pupilJoinUrl(inviteToken);

  return c.json({
    ok: true,
    schoolName: school.name,
    schoolSlug: school.slug,
    inviteUrl,
    adminUsername: admin.username,
    message:
      "School registered. Share your pupil link with students — they use it to create accounts and sign in.",
  });
});

authRoutes.post("/register/pupil", async (c) => {
  const body = registerPupilSchema.safeParse(await c.req.json());
  if (!body.success) {
    return c.json({ error: "Please fill in your name, team, and PIN." }, 400);
  }

  const school = await prisma.school.findUnique({
    where: { inviteToken: body.data.inviteToken.trim() },
  });
  if (!school) {
    return c.json({ error: "Invalid school link. Ask your teacher for the correct one." }, 404);
  }

  const username = await uniqueUsernameForSchool(
    school.id,
    body.data.firstName,
    async (schoolId, name) => {
      const existing = await prisma.user.findUnique({
        where: { schoolId_username: { schoolId, username: name } },
      });
      return existing !== null;
    },
  );

  const pinHash = await hashPin(body.data.pin);

  const user = await prisma.user.create({
    data: {
      schoolId: school.id,
      role: "STUDENT",
      username,
      pinHash,
      firstName: body.data.firstName.trim(),
      city: school.city,
      postcode: school.postcode,
      teamColour: body.data.teamColour,
      accountStatus: "PENDING",
      active: true,
      points: 0,
      level: "Getting started",
    },
  });

  return c.json({
    ok: true,
    username: user.username,
    schoolSlug: school.slug,
    schoolName: school.name,
    message:
      "Account created. Your teacher needs to approve it before you can sign in.",
  });
});

authRoutes.post("/login", async (c) => {
  const body = loginSchema.safeParse(await c.req.json());
  if (!body.success) {
    return c.json({ error: "Invalid login request" }, 400);
  }

  const slug = normalizeSchoolSlug(body.data.schoolSlug);
  const username = body.data.username.trim().toLowerCase();
  const { pin } = body.data;

  const school = await prisma.school.findUnique({ where: { slug } });
  let user = school
    ? await prisma.user.findUnique({
        where: { schoolId_username: { schoolId: school.id, username } },
      })
    : null;

  if (!user) {
    const trust = await prisma.trust.findUnique({ where: { slug } });
    if (trust) {
      user = await prisma.user.findFirst({
        where: { trustId: trust.id, username, schoolId: null },
      });
    }
  }

  if (!user || !user.active) {
    return c.json({ error: "Wrong school code, username, or PIN" }, 401);
  }

  const ok = await verifyPin(pin, user.pinHash);
  if (!ok) {
    return c.json({ error: "Wrong school code, username, or PIN" }, 401);
  }

  if (user.role === "STUDENT") {
    if (user.accountStatus === "PENDING") {
      return c.json(
        {
          error: "Your account is waiting for teacher approval.",
          code: "PENDING_APPROVAL",
        },
        403,
      );
    }
    if (user.accountStatus === "REJECTED") {
      return c.json(
        {
          error: "This account was not approved. Speak to your teacher.",
          code: "REJECTED",
        },
        403,
      );
    }
  }

  const token = await signToken({
    sub: user.id,
    role: user.role,
    schoolId: user.schoolId,
    trustId: user.trustId,
  });

  const schoolName =
    school?.name ??
    (user.schoolId
      ? (await prisma.school.findUnique({ where: { id: user.schoolId } }))?.name
      : "School");

  await prisma.auditEvent.create({
    data: {
      userId: user.id,
      type: "auth.login",
      category: "auth",
      summary: `Signed in as ${user.firstName}`,
      meta: JSON.stringify({ username: user.username, slug }),
    },
  });

  return c.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      yearGroup: user.yearGroup,
      points: user.points,
      level: user.level,
      role: user.role,
      schoolId: user.schoolId,
      schoolName,
      teamColour: user.teamColour,
      accountStatus: user.accountStatus,
    },
  });
});

authRoutes.post("/logout", async (c) => c.json({ ok: true }));
