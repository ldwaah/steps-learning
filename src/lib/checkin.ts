import { CHECK_IN_POINTS } from "../content";
import { isApiMode } from "./api/config";
import { apiCheckInToday, setApiCheckInToday } from "./api/progressCache";
import { apiSubmitCheckIn, syncApiUserFromResponse } from "./api/student";
import { logAudit } from "./audit";
import { getLevelForPoints, updateUser } from "./storage";

const CHECKIN_KEY = "steps_checkins";

export type MoodId = "okay" | "rough" | "angry" | "worried" | "shutdown";

export type CheckInRecord = {
  date: string;
  mood: MoodId;
  note?: string;
};

type CheckInStore = Record<string, CheckInRecord[]>;

export const MOOD_OPTIONS: { id: MoodId; label: string }[] = [
  { id: "okay", label: "Okay" },
  { id: "rough", label: "Rough" },
  { id: "angry", label: "Angry" },
  { id: "worried", label: "Worried" },
  { id: "shutdown", label: "Shut down" },
];

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function readStore(): CheckInStore {
  const raw = localStorage.getItem(CHECKIN_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as CheckInStore;
  } catch {
    return {};
  }
}

function writeStore(store: CheckInStore): void {
  localStorage.setItem(CHECKIN_KEY, JSON.stringify(store));
}

export function getTodayCheckIn(userId: string): CheckInRecord | null {
  const today = todayDate();
  const list = readStore()[userId] ?? [];
  return list.find((r) => r.date === today) ?? null;
}

export function hasCheckedInToday(userId: string): boolean {
  if (isApiMode()) return apiCheckInToday();
  return getTodayCheckIn(userId) !== null;
}

export function submitCheckIn(
  userId: string,
  mood: MoodId,
  note?: string,
): { ok: boolean; alreadyDone: boolean } {
  if (hasCheckedInToday(userId)) {
    return { ok: false, alreadyDone: true };
  }

  if (isApiMode()) {
    setApiCheckInToday(true);
    void apiSubmitCheckIn(mood, note)
      .then((res) => {
        if (!res.ok) setApiCheckInToday(false);
        else syncApiUserFromResponse(res.user ?? null);
      })
      .catch(() => setApiCheckInToday(false));
    return { ok: true, alreadyDone: false };
  }

  const store = readStore();
  const list = store[userId] ?? [];
  const trimmedNote = note?.trim();
  list.push({
    date: todayDate(),
    mood,
    ...(trimmedNote ? { note: trimmedNote } : {}),
  });
  store[userId] = list;
  writeStore(store);

  updateUser(userId, (u) => {
    const points = u.points + CHECK_IN_POINTS;
    return { points, level: getLevelForPoints(points) };
  });

  const moodLabel = MOOD_OPTIONS.find((m) => m.id === mood)?.label ?? mood;
  logAudit({
    userId,
    type: "wellbeing.check_in",
    summary: `Daily check-in: ${moodLabel}`,
    detail: trimmedNote ? "Note saved" : undefined,
    pointsDelta: CHECK_IN_POINTS,
    meta: { mood },
  });

  return { ok: true, alreadyDone: false };
}
