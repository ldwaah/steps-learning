import { apiFetch } from "./client";
import {
  hydrateProgressCache,
  type CachedTopicProgress,
} from "./progressCache";
import { setApiUser, getApiUser } from "./session";

export type StudentStateResponse = {
  user: {
    id: string;
    username: string;
    firstName: string;
    yearGroup: number | null;
    points: number;
    level: string;
  };
  progress: CachedTopicProgress[];
  checkInToday: boolean;
  regulateToday: boolean;
};

export async function hydrateStudentState(): Promise<StudentStateResponse> {
  const data = await apiFetch<StudentStateResponse>("/student/state");
  hydrateProgressCache({
    progress: data.progress,
    checkInToday: data.checkInToday,
    regulateToday: data.regulateToday,
  });
  const existing = getApiUser();
  if (existing) {
    setApiUser({
      ...existing,
      points: data.user.points,
      level: data.user.level,
      firstName: data.user.firstName,
      yearGroup: data.user.yearGroup,
    });
  }
  return data;
}

export async function apiSaveProgress(
  progress: CachedTopicProgress,
): Promise<void> {
  await apiFetch(`/student/progress/${progress.topicId}`, {
    method: "PUT",
    body: JSON.stringify(progress),
  });
}

export type SessionCompleteResponse = {
  pointsAwarded: number;
  pointsBase: number;
  pointsTimeBonus: number;
  message?: string;
  user: { points: number; level: string } | null;
};

export async function apiCompleteSession(body: {
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
}): Promise<SessionCompleteResponse> {
  return apiFetch<SessionCompleteResponse>("/student/sessions/complete", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function apiSubmitCheckIn(
  mood: string,
  note?: string,
): Promise<{
  ok: boolean;
  alreadyDone: boolean;
  points: number;
  user: { points: number; level: string } | null;
}> {
  return apiFetch("/student/check-in", {
    method: "POST",
    body: JSON.stringify({ mood, note }),
  });
}

export async function apiMarkRegulated(): Promise<{
  awarded: boolean;
  points: number;
  user: { points: number; level: string } | null;
}> {
  return apiFetch("/student/regulate", { method: "POST", body: "{}" });
}

export async function apiPostAudit(event: {
  type: string;
  category: string;
  summary: string;
  detail?: string;
  pointsDelta?: number;
  meta?: Record<string, string | number | boolean>;
}): Promise<void> {
  await apiFetch("/student/audit", {
    method: "POST",
    body: JSON.stringify(event),
  });
}

export async function apiFetchAudit(limit = 200): Promise<{
  events: Array<{
    id: string;
    userId: string;
    type: string;
    category: string;
    timestamp: string;
    summary: string;
    detail?: string;
    pointsDelta?: number;
    meta?: Record<string, string | number | boolean>;
  }>;
}> {
  return apiFetch(`/student/audit?limit=${limit}`);
}

export function patchApiUserPoints(points: number, level: string): void {
  const user = getApiUser();
  if (!user) return;
  setApiUser({ ...user, points, level });
}

export function syncApiUserFromResponse(user: { points: number; level: string } | null): void {
  if (!user) return;
  patchApiUserPoints(user.points, user.level);
}
