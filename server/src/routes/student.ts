import { Hono } from "hono";
import { z } from "zod";
import { prisma } from "../lib/db.js";
import type { AppVariables } from "../middleware/auth.js";
import { requireAuth, requireRoles } from "../middleware/auth.js";
import { appendAudit } from "../services/auditService.js";
import { getSchoolLeaderboard } from "../services/leaderboardService.js";
import {
  completeSession,
  listProgress,
  saveProgress,
} from "../services/progressService.js";
import {
  hasCheckedInToday,
  hasRegulatedToday,
  markRegulated,
  submitCheckIn,
} from "../services/wellbeingService.js";

export const studentRoutes = new Hono<{ Variables: AppVariables }>();

studentRoutes.use("*", requireAuth);
studentRoutes.use("*", requireRoles("STUDENT"));

studentRoutes.get("/leaderboard", async (c) => {
  const auth = c.get("auth");
  if (!auth.schoolId) return c.json({ error: "School required" }, 400);
  const board = await getSchoolLeaderboard(auth.schoolId, auth.sub);
  return c.json(board);
});

studentRoutes.get("/state", async (c) => {
  const auth = c.get("auth");
  const user = await prisma.user.findUnique({ where: { id: auth.sub } });
  if (!user) return c.json({ error: "User not found" }, 404);

  const [progress, checkInToday, regulateToday] = await Promise.all([
    listProgress(auth.sub),
    hasCheckedInToday(auth.sub),
    hasRegulatedToday(auth.sub),
  ]);

  return c.json({
    user: {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      yearGroup: user.yearGroup,
      points: user.points,
      level: user.level,
      teamColour: user.teamColour,
    },
    progress,
    checkInToday,
    regulateToday,
  });
});

const progressSchema = z.object({
  topicId: z.string(),
  completedBlockIds: z.array(z.string()),
  currentBlockId: z.string(),
  stepIndex: z.number().int().min(0),
});

studentRoutes.put("/progress/:topicId", async (c) => {
  const auth = c.get("auth");
  const body = progressSchema.safeParse(await c.req.json());
  if (!body.success) return c.json({ error: "Invalid progress" }, 400);

  const saved = await saveProgress(auth.sub, body.data);
  return c.json(saved);
});

const completeSchema = z.object({
  topicId: z.string(),
  blockId: z.string(),
  blockTitle: z.string(),
  startedAt: z.string(),
  completedAt: z.string(),
  durationMs: z.number().int().min(0),
  stepsTotal: z.number().int().min(1),
  quizRequired: z.boolean(),
  quizPassed: z.boolean(),
  quizScore: z.number().int().optional(),
  quizTotal: z.number().int().optional(),
  completedBlockIds: z.array(z.string()),
  nextBlockId: z.string(),
});

studentRoutes.post("/sessions/complete", async (c) => {
  const auth = c.get("auth");
  const body = completeSchema.safeParse(await c.req.json());
  if (!body.success) return c.json({ error: "Invalid session payload" }, 400);

  const user = await prisma.user.findUnique({ where: { id: auth.sub } });
  if (!user) return c.json({ error: "User not found" }, 404);

  const points = await completeSession(auth.sub, user.schoolId, body.data);

  const updated = await prisma.user.findUnique({ where: { id: auth.sub } });

  return c.json({
    pointsAwarded: points.total,
    pointsBase: points.base,
    pointsTimeBonus: points.timeBonus,
    message: points.reason,
    user: updated
      ? {
          points: updated.points,
          level: updated.level,
        }
      : null,
  });
});

studentRoutes.post("/check-in", async (c) => {
  const auth = c.get("auth");
  const body = z
    .object({
      mood: z.string(),
      note: z.string().optional(),
    })
    .safeParse(await c.req.json());
  if (!body.success) return c.json({ error: "Invalid check-in" }, 400);

  const result = await submitCheckIn(auth.sub, body.data.mood, body.data.note);
  const user = await prisma.user.findUnique({ where: { id: auth.sub } });
  return c.json({ ...result, user: user ? { points: user.points, level: user.level } : null });
});

studentRoutes.post("/regulate", async (c) => {
  const auth = c.get("auth");
  const result = await markRegulated(auth.sub);
  const user = await prisma.user.findUnique({ where: { id: auth.sub } });
  return c.json({ ...result, user: user ? { points: user.points, level: user.level } : null });
});

studentRoutes.get("/audit", async (c) => {
  const auth = c.get("auth");
  const limit = Number(c.req.query("limit") ?? 200);
  const events = await prisma.auditEvent.findMany({
    where: { userId: auth.sub },
    orderBy: { createdAt: "desc" },
    take: Math.min(limit, 500),
  });
  return c.json({
    events: events.map((e) => ({
      id: e.id,
      userId: e.userId,
      type: e.type,
      category: e.category,
      timestamp: e.createdAt.toISOString(),
      summary: e.summary,
      detail: e.detail ?? undefined,
      pointsDelta: e.pointsDelta ?? undefined,
      meta: e.meta ? JSON.parse(e.meta) : undefined,
    })),
  });
});

studentRoutes.post("/audit", async (c) => {
  const auth = c.get("auth");
  const body = z
    .object({
      type: z.string(),
      category: z.string(),
      summary: z.string(),
      detail: z.string().optional(),
      pointsDelta: z.number().int().optional(),
      meta: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
    })
    .safeParse(await c.req.json());
  if (!body.success) return c.json({ error: "Invalid audit event" }, 400);

  await appendAudit({ userId: auth.sub, ...body.data });
  return c.json({ ok: true });
});
