import { Hono } from "hono";
import { z } from "zod";
import { prisma } from "../lib/db.js";
import { signToken, verifyPin } from "../lib/auth.js";

const loginSchema = z.object({
  schoolSlug: z.string().min(1),
  username: z.string().min(1),
  pin: z.string().min(4),
});

export const authRoutes = new Hono();

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
    },
  });
});

authRoutes.post("/logout", async (c) => c.json({ ok: true }));
