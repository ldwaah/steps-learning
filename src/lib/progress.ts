import { getTopic, listPathways } from "../content";
import type { BlockData } from "../content/types";
import { isApiMode } from "./api/config";
import {
  getCachedTopicProgress,
  setCachedTopicProgress,
} from "./api/progressCache";
import {
  apiCompleteSession,
  apiSaveProgress,
  syncApiUserFromResponse,
} from "./api/student";
import { logAudit } from "./audit";
import { getLevelForPoints } from "./levels";
import {
  blockHasQuiz,
  calculateSessionPoints,
  saveSessionCompletion,
  type SessionEvidence,
} from "./sessionEvidence";
import { getUserById, updateUser } from "./storage";
import { getCurrentUser } from "./authSession";

const PROGRESS_KEY = "steps_progress";

export type TopicProgress = {
  topicId: string;
  completedBlockIds: string[];
  currentBlockId: string;
  stepIndex: number;
};

export type UserProgressStore = Record<string, Record<string, TopicProgress>>;

function readStore(): UserProgressStore {
  const raw = localStorage.getItem(PROGRESS_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as UserProgressStore;
  } catch {
    return {};
  }
}

function writeStore(store: UserProgressStore): void {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(store));
}

function defaultProgress(topicId: string): TopicProgress {
  const topic = getTopic(topicId);
  const firstBlockId = topic?.blocks[0]?.id ?? "b1";
  return {
    topicId,
    completedBlockIds: [],
    currentBlockId: firstBlockId,
    stepIndex: 0,
  };
}

export function getTopicProgress(
  userId: string,
  topicId: string,
): TopicProgress {
  if (isApiMode()) {
    return getCachedTopicProgress(topicId) ?? defaultProgress(topicId);
  }
  const store = readStore();
  return store[userId]?.[topicId] ?? defaultProgress(topicId);
}

function saveTopicProgress(userId: string, progress: TopicProgress): void {
  if (isApiMode()) {
    setCachedTopicProgress(progress);
    void apiSaveProgress(progress).catch(() => {});
    return;
  }
  const store = readStore();
  if (!store[userId]) store[userId] = {};
  store[userId][progress.topicId] = progress;
  writeStore(store);
}

export function setStepIndex(
  userId: string,
  topicId: string,
  stepIndex: number,
): void {
  const progress = getTopicProgress(userId, topicId);
  saveTopicProgress(userId, { ...progress, stepIndex });
}

export function getBlock(
  topicId: string,
  blockId: string,
): BlockData | null {
  const topic = getTopic(topicId);
  return topic?.blocks.find((b) => b.id === blockId) ?? null;
}

function firstIncompleteBlock(
  topicId: string,
  completedIds: string[],
): BlockData | null {
  const topic = getTopic(topicId);
  if (!topic) return null;
  return topic.blocks.find((b) => !completedIds.includes(b.id)) ?? null;
}

export function getCurrentBlock(
  userId: string,
  topicId: string,
): BlockData | null {
  const topic = getTopic(topicId);
  if (!topic) return null;

  const progress = getTopicProgress(userId, topicId);
  const byId = getBlock(topicId, progress.currentBlockId);
  if (byId && !progress.completedBlockIds.includes(byId.id)) {
    return byId;
  }
  return firstIncompleteBlock(topicId, progress.completedBlockIds);
}

export type CompleteBlockResult = {
  pointsAwarded: number;
  pointsBase: number;
  pointsTimeBonus: number;
  message?: string;
};

export function completeBlock(
  userId: string,
  topicId: string,
  rawEvidence: Omit<
    SessionEvidence,
    "blockTitle" | "pointsAwarded" | "blockReason" | "pointsTotal" | "pointsBase" | "pointsTimeBonus"
  >,
): CompleteBlockResult {
  const topic = getTopic(topicId);
  if (!topic) {
    return { pointsAwarded: 0, pointsBase: 0, pointsTimeBonus: 0, message: "Pathway not found" };
  }

  const progress = getTopicProgress(userId, topicId);
  const current = getBlock(topicId, progress.currentBlockId);
  const blockId = current?.id ?? progress.currentBlockId;
  const blockTitle = current?.title ?? blockId;

  const quizRequired = current ? blockHasQuiz(current) : rawEvidence.quizRequired;
  const points = calculateSessionPoints(
    rawEvidence.durationMs,
    quizRequired,
    rawEvidence.quizPassed,
  );

  const evidence: SessionEvidence = {
    ...rawEvidence,
    blockTitle,
    quizRequired,
    pointsTotal: points.total,
    pointsBase: points.base,
    pointsTimeBonus: points.timeBonus,
    pointsAwarded: points.awarded,
    blockReason: points.reason,
  };

  const completedIds = progress.completedBlockIds.includes(blockId)
    ? progress.completedBlockIds
    : [...progress.completedBlockIds, blockId];

  const next = firstIncompleteBlock(topicId, completedIds);

  const updated: TopicProgress = {
    ...progress,
    completedBlockIds: completedIds,
    currentBlockId: next?.id ?? blockId,
    stepIndex: 0,
  };
  saveTopicProgress(userId, updated);

  const pointsAwarded = points.total;

  if (isApiMode()) {
    const startPoints = getCurrentUser()?.points ?? 0;
    if (pointsAwarded > 0) {
      syncApiUserFromResponse({
        points: startPoints + pointsAwarded,
        level: getLevelForPoints(startPoints + pointsAwarded).label,
      });
    }
    void apiCompleteSession({
      topicId,
      blockId,
      blockTitle,
      startedAt: rawEvidence.startedAt,
      completedAt: rawEvidence.completedAt,
      durationMs: rawEvidence.durationMs,
      stepsTotal: rawEvidence.stepsTotal,
      quizRequired,
      quizPassed: rawEvidence.quizPassed,
      quizScore: rawEvidence.quizScore,
      quizTotal: rawEvidence.quizTotal,
      completedBlockIds: completedIds,
      nextBlockId: updated.currentBlockId,
    })
      .then((res) => {
        syncApiUserFromResponse(res.user);
      })
      .catch(() => {});
  } else {
    saveSessionCompletion(userId, evidence);
    if (pointsAwarded > 0) {
      updateUser(userId, (u) => {
        const next = u.points + pointsAwarded;
        return { points: next, level: getLevelForPoints(next).label };
      });
    }

    const durationSec = Math.round(rawEvidence.durationMs / 1000);
    const detail =
      points.reason ??
      (points.timeBonus > 0
        ? `${points.base} base + ${points.timeBonus} time bonus`
        : topic.title);

    logAudit({
      userId,
      type: "learning.session_complete",
      summary:
        pointsAwarded > 0
          ? `Finished session: ${blockTitle}`
          : `Session saved (no points): ${blockTitle}`,
      detail,
      pointsDelta: pointsAwarded > 0 ? pointsAwarded : undefined,
      meta: {
        topicId,
        blockId,
        durationSec,
        quizRequired,
        quizPassed: rawEvidence.quizPassed,
        quizScore: rawEvidence.quizScore ?? 0,
        quizTotal: rawEvidence.quizTotal ?? 0,
        pointsBase: points.base,
        pointsTimeBonus: points.timeBonus,
        pointsTotal: points.total,
      },
    });
  }

  const allBlockIds = topic.blocks.map((b) => b.id);
  const pathwayDone = allBlockIds.every((id) => completedIds.includes(id));
  if (pathwayDone) {
    logAudit({
      userId,
      type: "learning.pathway_complete",
      summary: `Finished pathway: ${topic.title}`,
      meta: { topicId },
    });
  }

  return {
    pointsAwarded,
    pointsBase: points.base,
    pointsTimeBonus: points.timeBonus,
    message: points.reason,
  };
}

export type SessionStatus = "done" | "current" | "upcoming";

export type PathwaySessionRow = {
  id: string;
  title: string;
  status: SessionStatus;
};

export type PathwayProgressDetail = {
  topicId: string;
  title: string;
  percent: number;
  sessions: PathwaySessionRow[];
};

export function getPathwayProgressDetail(
  userId: string,
  topicId: string,
): PathwayProgressDetail | null {
  const topic = getTopic(topicId);
  if (!topic) return null;
  const progress = getTopicProgress(userId, topicId);
  const current = getCurrentBlock(userId, topicId);

  const sessions: PathwaySessionRow[] = topic.blocks.map((block) => {
    if (progress.completedBlockIds.includes(block.id)) {
      return { id: block.id, title: block.title, status: "done" };
    }
    if (current?.id === block.id) {
      return { id: block.id, title: block.title, status: "current" };
    }
    return { id: block.id, title: block.title, status: "upcoming" };
  });

  return {
    topicId,
    title: topic.title,
    percent: getPathwayProgressPercent(userId, topicId),
    sessions,
  };
}

export function getAllPathwayProgressDetails(
  userId: string,
): PathwayProgressDetail[] {
  return listPathways()
    .map((p) => getPathwayProgressDetail(userId, p.id))
    .filter((d): d is PathwayProgressDetail => d !== null);
}

export type OverallStats = {
  points: number;
  levelLabel: string;
  sessionsCompleted: number;
  totalSessions: number;
  pathwaysStarted: number;
  pathwaysComplete: number;
};

export function getOverallStats(userId: string): OverallStats {
  const pathways = listPathways();
  let sessionsCompleted = 0;
  let totalSessions = 0;
  let pathwaysStarted = 0;
  let pathwaysComplete = 0;

  for (const p of pathways) {
    totalSessions += p.blocks.length;
    const prog = getTopicProgress(userId, p.id);
    sessionsCompleted += prog.completedBlockIds.length;
    if (prog.completedBlockIds.length > 0) pathwaysStarted += 1;
    if (prog.completedBlockIds.length >= p.blocks.length) pathwaysComplete += 1;
  }

  const points = isApiMode()
    ? (getCurrentUser()?.points ?? 0)
    : (getUserById(userId)?.points ?? 0);

  return {
    points,
    levelLabel: getLevelForPoints(points).label,
    sessionsCompleted,
    totalSessions,
    pathwaysStarted,
    pathwaysComplete,
  };
}

export type TopicSummary = {
  topicId: string;
  title: string;
  blockNumber: number;
  totalBlocks: number;
  stepIndex: number;
  isFinished: boolean;
  hasMoreBlocks: boolean;
  sessionTitle?: string;
};

export function getTopicSummary(
  userId: string,
  topicId: string,
): TopicSummary | null {
  const topic = getTopic(topicId);
  if (!topic) return null;

  const progress = getTopicProgress(userId, topicId);
  const totalBlocks = topic.blocks.length;
  const completedCount = progress.completedBlockIds.length;
  const isFinished = completedCount >= totalBlocks;
  const displayBlock = isFinished
    ? totalBlocks
    : Math.min(totalBlocks, completedCount + 1);

  const currentBlock = getCurrentBlock(userId, topicId);

  return {
    topicId,
    title: topic.title,
    blockNumber: displayBlock,
    totalBlocks,
    stepIndex: progress.stepIndex,
    isFinished,
    hasMoreBlocks: !isFinished && currentBlock !== null,
    sessionTitle: currentBlock?.title,
  };
}

export function getInProgressTopics(userId: string): TopicSummary[] {
  return listPathways()
    .map((p) => getTopicSummary(userId, p.id))
    .filter((s): s is TopicSummary => s !== null && !s.isFinished);
}

export function getFinishedTopics(
  userId: string,
): { topicId: string; title: string }[] {
  return listPathways()
    .map((p) => getTopicSummary(userId, p.id))
    .filter((s): s is TopicSummary => s !== null && s.isFinished)
    .map((s) => ({ topicId: s.topicId, title: s.title }));
}

export function getPathwayProgressPercent(
  userId: string,
  topicId: string,
): number {
  const topic = getTopic(topicId);
  if (!topic || topic.blocks.length === 0) return 0;
  const progress = getTopicProgress(userId, topicId);
  return Math.round(
    (progress.completedBlockIds.length / topic.blocks.length) * 100,
  );
}
