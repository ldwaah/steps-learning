import { Hono } from "hono";
import { z } from "zod";
import { prisma } from "../lib/db.js";
import type { AppVariables } from "../middleware/auth.js";
import { requireAuth, requireRoles } from "../middleware/auth.js";
import { getSchoolLeaderboard } from "../services/leaderboardService.js";

const STAFF_ROLES = ["STAFF", "DSL", "SCHOOL_ADMIN", "TRUST_ADMIN"] as const;

export const staffRoutes = new Hono<{ Variables: AppVariables }>();

staffRoutes.use("*", requireAuth);
staffRoutes.use("*", requireRoles(...STAFF_ROLES));

staffRoutes.get("/pending", async (c) => {
  const auth = c.get("auth");
  if (!auth.schoolId) {
    return c.json({ error: "School context required" }, 400);
  }

  const pending = await prisma.user.findMany({
    where: {
      schoolId: auth.schoolId,
      role: "STUDENT",
      accountStatus: "PENDING",
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      firstName: true,
      username: true,
      teamColour: true,
      createdAt: true,
    },
  });

  return c.json({ pending });
});

staffRoutes.post("/approve/:userId", async (c) => {
  const auth = c.get("auth");
  const userId = c.req.param("userId");
  if (!auth.schoolId) return c.json({ error: "School context required" }, 400);

  const user = await prisma.user.findFirst({
    where: { id: userId, schoolId: auth.schoolId, role: "STUDENT" },
  });
  if (!user) return c.json({ error: "Student not found" }, 404);

  await prisma.user.update({
    where: { id: userId },
    data: { accountStatus: "APPROVED", active: true },
  });

  return c.json({ ok: true });
});

staffRoutes.post("/reject/:userId", async (c) => {
  const auth = c.get("auth");
  const userId = c.req.param("userId");
  if (!auth.schoolId) return c.json({ error: "School context required" }, 400);

  const user = await prisma.user.findFirst({
    where: { id: userId, schoolId: auth.schoolId, role: "STUDENT" },
  });
  if (!user) return c.json({ error: "Student not found" }, 404);

  await prisma.user.update({
    where: { id: userId },
    data: { accountStatus: "REJECTED", active: false },
  });

  return c.json({ ok: true });
});

staffRoutes.get("/leaderboard", async (c) => {
  const auth = c.get("auth");
  if (!auth.schoolId) return c.json({ error: "School context required" }, 400);

  const board = await getSchoolLeaderboard(auth.schoolId, auth.sub);
  return c.json(board);
});
