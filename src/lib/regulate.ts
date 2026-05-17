import { REGULATE_POINTS } from "../content";
import { isApiMode } from "./api/config";
import { apiRegulateToday, setApiRegulateToday } from "./api/progressCache";
import { apiMarkRegulated, syncApiUserFromResponse } from "./api/student";
import { logAudit } from "./audit";
import { getLevelForPoints, updateUser } from "./storage";

const REGULATE_KEY = "steps_regulate";

type RegulateStore = Record<string, string[]>;

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function readStore(): RegulateStore {
  const raw = localStorage.getItem(REGULATE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as RegulateStore;
  } catch {
    return {};
  }
}

function writeStore(store: RegulateStore): void {
  localStorage.setItem(REGULATE_KEY, JSON.stringify(store));
}

export function hasRegulatedToday(userId: string): boolean {
  if (isApiMode()) return apiRegulateToday();
  const today = todayDate();
  const dates = readStore()[userId] ?? [];
  return dates.includes(today);
}

export function markRegulatedToday(userId: string): { awarded: boolean } {
  if (hasRegulatedToday(userId)) {
    return { awarded: false };
  }

  if (isApiMode()) {
    setApiRegulateToday(true);
    void apiMarkRegulated()
      .then((res) => {
        if (!res.awarded) setApiRegulateToday(false);
        else syncApiUserFromResponse(res.user);
      })
      .catch(() => setApiRegulateToday(false));
    return { awarded: true };
  }

  const store = readStore();
  const dates = store[userId] ?? [];
  dates.push(todayDate());
  store[userId] = dates;
  writeStore(store);

  updateUser(userId, (u) => {
    const points = u.points + REGULATE_POINTS;
    return { points, level: getLevelForPoints(points) };
  });

  logAudit({
    userId,
    type: "wellbeing.regulate",
    summary: "Completed breathing exercise",
    pointsDelta: REGULATE_POINTS,
  });

  return { awarded: true };
}
