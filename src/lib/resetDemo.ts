import { DEFAULT_USERS, DEMO_USER_IDS, getUsers } from "./storage";

const USERS_KEY = "steps_users";

const PROGRESS_KEY = "steps_progress";
const CHECKIN_KEY = "steps_checkins";
const REGULATE_KEY = "steps_regulate";
const AUDIT_KEY = "steps_audit_log";
const COMPLETIONS_KEY = "steps_session_completions";

export type ResetDemoResult = {
  users: { username: string; points: number; level: string }[];
  cleared: string[];
};

function removeDemoKeys(storeKey: string): boolean {
  const raw = localStorage.getItem(storeKey);
  if (!raw) return false;
  try {
    const store = JSON.parse(raw) as Record<string, unknown>;
    let changed = false;
    for (const id of DEMO_USER_IDS) {
      if (id in store) {
        delete store[id];
        changed = true;
      }
    }
    if (changed) localStorage.setItem(storeKey, JSON.stringify(store));
    return changed;
  } catch {
    return false;
  }
}

function filterDemoFromArray(storeKey: string): boolean {
  const raw = localStorage.getItem(storeKey);
  if (!raw) return false;
  try {
    const list = JSON.parse(raw) as { userId?: string }[];
    if (!Array.isArray(list)) return false;
    const filtered = list.filter(
      (item) => !item.userId || !DEMO_USER_IDS.includes(item.userId as (typeof DEMO_USER_IDS)[number]),
    );
    if (filtered.length === list.length) return false;
    localStorage.setItem(storeKey, JSON.stringify(filtered));
    return true;
  } catch {
    return false;
  }
}

function clearDemoSessionFlags(): void {
  const keys: string[] = [];
  for (let i = 0; i < sessionStorage.length; i += 1) {
    const key = sessionStorage.key(i);
    if (key?.startsWith("steps_audit_started_u1") || key?.startsWith("steps_audit_started_u2")) {
      keys.push(key);
    }
  }
  keys.forEach((key) => sessionStorage.removeItem(key));
}

/** Reset alex & jordan to seed scores and wipe their local activity. */
export function resetDemoParticipants(): ResetDemoResult {
  const cleared: string[] = [];

  const users = getUsers().map((u) => {
    if (!DEMO_USER_IDS.includes(u.id as (typeof DEMO_USER_IDS)[number])) return u;
    const seed = DEFAULT_USERS.find((d) => d.id === u.id);
    if (!seed) return u;
    return { ...u, points: seed.points, level: seed.level };
  });
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  if (removeDemoKeys(PROGRESS_KEY)) cleared.push("pathway progress");
  if (removeDemoKeys(CHECKIN_KEY)) cleared.push("check-ins");
  if (removeDemoKeys(REGULATE_KEY)) cleared.push("breathing");
  if (filterDemoFromArray(AUDIT_KEY)) cleared.push("activity log entries");
  if (filterDemoFromArray(COMPLETIONS_KEY)) cleared.push("session evidence");

  clearDemoSessionFlags();

  return {
    users: DEMO_USER_IDS.map((id) => {
      const u = users.find((x) => x.id === id)!;
      return { username: u.username, points: u.points, level: u.level };
    }),
    cleared,
  };
}
