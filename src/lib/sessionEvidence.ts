import {
  SESSION_BASE_POINTS,
  SESSION_MAX_POINTS,
  SESSION_TIME_BONUS_MAX,
} from "../content";
import type { BlockData } from "../content/types";

/** Time bonus starts scaling (2 min — read + steps, not a fake 1 min gate). */
export const SESSION_BONUS_FROM_MS = 2 * 60 * 1000;

/** Full time bonus at ~8 min (realistic for a ~10–12 min session). */
export const SESSION_FULL_BONUS_AT_MS = 8 * 60 * 1000;

export type SessionPointsBreakdown = {
  total: number;
  base: number;
  timeBonus: number;
  awarded: boolean;
  reason?: string;
};

export type SessionEvidence = {
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
  pointsTotal: number;
  pointsBase: number;
  pointsTimeBonus: number;
  pointsAwarded: boolean;
  blockReason?: string;
};

export type SessionCompletionRecord = SessionEvidence & {
  userId: string;
};

const COMPLETIONS_KEY = "steps_session_completions";
const MAX_RECORDS = 500;

function readAll(): SessionCompletionRecord[] {
  const raw = localStorage.getItem(COMPLETIONS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as SessionCompletionRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(records: SessionCompletionRecord[]): void {
  localStorage.setItem(COMPLETIONS_KEY, JSON.stringify(records.slice(-MAX_RECORDS)));
}

export function blockHasQuiz(block: BlockData): boolean {
  return block.steps.some((s) => s.type === "quiz");
}

export function calculateSessionPoints(
  durationMs: number,
  quizRequired: boolean,
  quizPassed: boolean,
): SessionPointsBreakdown {
  if (quizRequired && !quizPassed) {
    return {
      total: 0,
      base: 0,
      timeBonus: 0,
      awarded: false,
      reason: "Quick check not passed",
    };
  }

  const base = SESSION_BASE_POINTS;
  let timeBonus = 0;

  if (durationMs >= SESSION_BONUS_FROM_MS) {
    const span = SESSION_FULL_BONUS_AT_MS - SESSION_BONUS_FROM_MS;
    const inBand = Math.min(durationMs - SESSION_BONUS_FROM_MS, span);
    timeBonus = Math.round((inBand / span) * SESSION_TIME_BONUS_MAX);
  }

  const total = Math.min(base + timeBonus, SESSION_MAX_POINTS);

  return {
    total,
    base,
    timeBonus,
    awarded: total > 0,
  };
}

export function saveSessionCompletion(
  userId: string,
  evidence: SessionEvidence,
): void {
  const records = readAll();
  records.push({ userId, ...evidence });
  writeAll(records);
}

export function getSessionCompletionsForUser(
  userId: string,
  limit = 30,
): SessionCompletionRecord[] {
  return readAll()
    .filter((r) => r.userId === userId)
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
    .slice(0, limit);
}

export function getSessionsCompletedToday(userId: string): number {
  const today = new Date().toISOString().slice(0, 10);
  return readAll().filter(
    (r) =>
      r.userId === userId &&
      r.completedAt.startsWith(today) &&
      r.pointsAwarded,
  ).length;
}

export function getSessionCompletionsForStaff(limit = 40): SessionCompletionRecord[] {
  return readAll()
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
    .slice(0, limit);
}

export function formatDuration(ms: number): string {
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  const rem = sec % 60;
  return rem > 0 ? `${min}m ${rem}s` : `${min}m`;
}

export function formatEvidenceLine(record: SessionCompletionRecord): string {
  const parts: string[] = [formatDuration(record.durationMs)];
  if (record.quizRequired) {
    parts.push(
      record.quizPassed
        ? `Quiz ${record.quizScore ?? "?"}/${record.quizTotal ?? "?"}`
        : "Quiz not passed",
    );
  }
  if (record.pointsAwarded) {
    const bonus =
      record.pointsTimeBonus > 0 ? ` (${record.pointsBase}+${record.pointsTimeBonus})` : "";
    parts.push(`+${record.pointsTotal} pts${bonus}`);
  } else {
    parts.push("No points");
  }
  return parts.join(" · ");
}

export function formatPointsHint(): string {
  return `${SESSION_BASE_POINTS} pts for finishing + up to ${SESSION_TIME_BONUS_MAX} more for time on the session (full bonus around 8 min).`;
}
