import { prisma } from "../lib/db.js";
import { parseJsonArray, toJsonArray } from "../lib/json.js";
import { levelLabelForPoints } from "../lib/levels.js";
import { calculateSessionPoints } from "../lib/sessionPoints.js";
import { appendAudit } from "./auditService.js";

export type TopicProgressDto = {
  topicId: string;
  completedBlockIds: string[];
  currentBlockId: string;
  stepIndex: number;
};

function mapProgress(row: {
  topicId: string;
  completedBlockIds: string;
  currentBlockId: string;
  stepIndex: number;
}): TopicProgressDto {
  return {
    topicId: row.topicId,
    completedBlockIds: parseJsonArray(row.completedBlockIds),
    currentBlockId: row.currentBlockId,
    stepIndex: row.stepIndex,
  };
}

export async function listProgress(userId: string): Promise<TopicProgressDto[]> {
  const rows = await prisma.topicProgress.findMany({ where: { userId } });
  return rows.map(mapProgress);
}

export async function getProgress(
  userId: string,
  topicId: string,
): Promise<TopicProgressDto | null> {
  const row = await prisma.topicProgress.findUnique({
    where: { userId_topicId: { userId, topicId } },
  });
  return row ? mapProgress(row) : null;
}

export async function saveProgress(
  userId: string,
  progress: TopicProgressDto,
): Promise<TopicProgressDto> {
  const row = await prisma.topicProgress.upsert({
    where: { userId_topicId: { userId, topicId: progress.topicId } },
    create: {
      userId,
      topicId: progress.topicId,
      completedBlockIds: toJsonArray(progress.completedBlockIds),
      currentBlockId: progress.currentBlockId,
      stepIndex: progress.stepIndex,
    },
    update: {
      completedBlockIds: toJsonArray(progress.completedBlockIds),
      currentBlockId: progress.currentBlockId,
      stepIndex: progress.stepIndex,
    },
  });
  return mapProgress(row);
}

export async function addPoints(userId: string, delta: number): Promise<void> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { points: { increment: delta } },
  });
  await prisma.user.update({
    where: { id: userId },
    data: { level: levelLabelForPoints(user.points) },
  });
}

export type CompleteSessionInput = {
  topicId: string;
  blockId: string;
  blockTitle: string;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  stepsTotal: number;
  quizRequired: boolean;
  quizPassed: boolean;
  quizScore?: number;
  quizTotal?: number;
  completedBlockIds: string[];
  nextBlockId: string;
};

export async function completeSession(
  userId: string,
  schoolId: string | null,
  input: CompleteSessionInput,
) {
  const points = calculateSessionPoints(
    input.durationMs,
    input.quizRequired,
    input.quizPassed,
  );

  await saveProgress(userId, {
    topicId: input.topicId,
    completedBlockIds: input.completedBlockIds,
    currentBlockId: input.nextBlockId,
    stepIndex: 0,
  });

  await prisma.sessionCompletion.create({
    data: {
      userId,
      schoolId,
      topicId: input.topicId,
      blockId: input.blockId,
      blockTitle: input.blockTitle,
      startedAt: new Date(input.startedAt),
      completedAt: new Date(input.completedAt),
      durationMs: input.durationMs,
      stepsTotal: input.stepsTotal,
      quizRequired: input.quizRequired,
      quizPassed: input.quizPassed,
      quizScore: input.quizScore,
      quizTotal: input.quizTotal,
      pointsTotal: points.total,
      pointsBase: points.base,
      pointsTimeBonus: points.timeBonus,
      pointsAwarded: points.awarded,
      blockReason: points.reason,
    },
  });

  if (points.total > 0) {
    await addPoints(userId, points.total);
  }

  await appendAudit({
    userId,
    type: "learning.session_complete",
    category: "learning",
    summary:
      points.total > 0
        ? `Finished session: ${input.blockTitle}`
        : `Session saved (no points): ${input.blockTitle}`,
    detail:
      points.reason ??
      (points.timeBonus > 0
        ? `${points.base} base + ${points.timeBonus} time bonus`
        : undefined),
    pointsDelta: points.total > 0 ? points.total : undefined,
    meta: {
      topicId: input.topicId,
      blockId: input.blockId,
      durationSec: Math.round(input.durationMs / 1000),
      quizRequired: input.quizRequired,
      quizPassed: input.quizPassed,
      pointsBase: points.base,
      pointsTimeBonus: points.timeBonus,
      pointsTotal: points.total,
    },
  });

  return points;
}
