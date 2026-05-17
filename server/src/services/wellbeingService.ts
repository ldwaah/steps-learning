import { CHECK_IN_POINTS, REGULATE_POINTS } from "../lib/constants.js";
import { prisma } from "../lib/db.js";
import { levelLabelForPoints } from "../lib/levels.js";
import { appendAudit } from "./auditService.js";

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function hasCheckedInToday(userId: string): Promise<boolean> {
  const row = await prisma.checkIn.findUnique({
    where: { userId_date: { userId, date: todayDate() } },
  });
  return row !== null;
}

export async function submitCheckIn(
  userId: string,
  mood: string,
  note?: string,
): Promise<{ ok: boolean; alreadyDone: boolean; points: number }> {
  const date = todayDate();
  const existing = await prisma.checkIn.findUnique({
    where: { userId_date: { userId, date } },
  });
  if (existing) return { ok: false, alreadyDone: true, points: 0 };

  await prisma.checkIn.create({
    data: { userId, date, mood, note: note?.trim() || null },
  });

  const user = await prisma.user.update({
    where: { id: userId },
    data: { points: { increment: CHECK_IN_POINTS } },
  });
  await prisma.user.update({
    where: { id: userId },
    data: { level: levelLabelForPoints(user.points) },
  });

  await appendAudit({
    userId,
    type: "wellbeing.check_in",
    category: "wellbeing",
    summary: `Daily check-in: ${mood}`,
    detail: note?.trim() ? "Note saved" : undefined,
    pointsDelta: CHECK_IN_POINTS,
    meta: { mood },
  });

  return { ok: true, alreadyDone: false, points: CHECK_IN_POINTS };
}

export async function hasRegulatedToday(userId: string): Promise<boolean> {
  const row = await prisma.regulateLog.findUnique({
    where: { userId_date: { userId, date: todayDate() } },
  });
  return row !== null;
}

export async function markRegulated(
  userId: string,
): Promise<{ awarded: boolean; points: number }> {
  const date = todayDate();
  const existing = await prisma.regulateLog.findUnique({
    where: { userId_date: { userId, date } },
  });
  if (existing) return { awarded: false, points: 0 };

  await prisma.regulateLog.create({ data: { userId, date } });

  const user = await prisma.user.update({
    where: { id: userId },
    data: { points: { increment: REGULATE_POINTS } },
  });
  await prisma.user.update({
    where: { id: userId },
    data: { level: levelLabelForPoints(user.points) },
  });

  await appendAudit({
    userId,
    type: "wellbeing.regulate",
    category: "wellbeing",
    summary: "Completed breathing exercise",
    pointsDelta: REGULATE_POINTS,
  });

  return { awarded: true, points: REGULATE_POINTS };
}
