import { Hono } from "hono";
import { z } from "zod";
import { prisma } from "../lib/db.js";
import { hashPin, signToken, verifyPin } from "../lib/auth.js";
import { uniqueUsernameForSchool } from "../lib/username.js";

const loginSchema = z.object({
  schoolSlug: z.string().min(1),
  username: z.string().min(1),
  pin: z.string().min(4),
});

const registerSchema = z.object({
  schoolSlug: z.string().min(1),
  firstName: z.string().min(1).max(40),
  teamColour: z.enum(["RED", "BLUE"]),
  pin: z.string().min(4).max(6),
});

const STAFF_ROLES = ["STAFF", "DSL", "SCHOOL_ADMIN", "TRUST_ADMIN"] as const;

export const authRoutes = new Hono();

authRoutes.post("/register", async (c) => {
  const body = registerSchema.safeParse(await c.req.json());
  if (!body.success) {
    return c.json({ error: "Please fill in name, team, PIN, and school code." }, 400);
  }

  const slug = body.data.schoolSlug.trim().toLowerCase();
  const school = await prisma.school.findUnique({ where: { slug } });
  if (!school) {
    return c.json({ error: "School code not found." }, 404);
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
      trustId: school.trustId,
      role: "STUDENT",
      username,
      pinHash,
      firstName: body.data.firstName.trim(),
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
    message:
      "Account created. Your teacher needs to approve it before you can sign in.",
  });
});

authRoutes.post("/login", async (c) => {
  const body = loginSchema.safeParse(await c.req.json());
  if (!body.success) {
    return c.json({ error: "Invalid login request" }, 400);
  }

  const slug = body.data.schoolSlug.trim().toLowerCase();
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
    return c.json({ error: "Wrong school, username, or PIN" }, 401);
  }

  const ok = await verifyPin(pin, user.pinHash);
  if (!ok) {
    return c.json({ error: "Wrong school, username, or PIN" }, 401);
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
      : "Trust");

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
