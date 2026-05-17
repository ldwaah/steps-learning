import { getLevelForPoints as getLevelInfo } from "./levels";
import type { AccountStatus, TeamColour } from "./teams";

const USERS_KEY = "steps_users";
const SESSION_KEY = "steps_session";
const STAFF_SESSION_KEY = "steps_staff_session";

export type YearGroup = 7 | 8 | 9 | 10 | 11;

export type StoredUser = {
  id: string;
  username: string;
  pin: string;
  firstName: string;
  yearGroup: YearGroup;
  points: number;
  level: string;
  teamColour: TeamColour;
  accountStatus: AccountStatus;
};

export type Session = {
  userId: string;
  loggedInAt: string;
};

export const DEMO_USER_IDS = ["u1", "u2"] as const;

export const DEFAULT_USERS: StoredUser[] = [];

export function ensureSeedUsers(): void {
  if (localStorage.getItem(USERS_KEY)) return;
  localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
}

export function getUsers(): StoredUser[] {
  ensureSeedUsers();
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as StoredUser[];
  } catch {
    return [];
  }
}

export function saveUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function generateLocalUsername(firstName: string): string {
  const base = firstName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 10) || "student";
  const suffix = String(Math.floor(1000 + Math.random() * 9000));
  const username = `${base}${suffix}`;
  if (getUsers().some((u) => u.username === username)) {
    return `${base}${Date.now().toString(36).slice(-4)}`;
  }
  return username;
}

export function findUser(username: string, pin: string): StoredUser | null {
  const normalised = username.trim().toLowerCase();
  const user =
    getUsers().find(
      (u) => u.username.toLowerCase() === normalised && u.pin === pin,
    ) ?? null;
  if (!user) return null;
  if (user.accountStatus === "PENDING") return null;
  if (user.accountStatus === "REJECTED") return null;
  return user;
}

export function findUserIncludingPending(
  username: string,
  pin: string,
): StoredUser | null {
  const normalised = username.trim().toLowerCase();
  return (
    getUsers().find(
      (u) => u.username.toLowerCase() === normalised && u.pin === pin,
    ) ?? null
  );
}

export function setStaffSession(active: boolean): void {
  if (active) localStorage.setItem(STAFF_SESSION_KEY, "1");
  else localStorage.removeItem(STAFF_SESSION_KEY);
}

export function isStaffSession(): boolean {
  return localStorage.getItem(STAFF_SESSION_KEY) === "1";
}

export function getUserById(id: string): StoredUser | null {
  return getUsers().find((u) => u.id === id) ?? null;
}

export function setSession(userId: string): void {
  const session: Session = {
    userId,
    loggedInAt: new Date().toISOString(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getSession(): Session | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getLocalSessionUser(): StoredUser | null {
  const session = getSession();
  if (!session) return null;
  return getUserById(session.userId);
}

/** @deprecated Use authSession.getCurrentUser */
export function getCurrentUser(): StoredUser | null {
  return getLocalSessionUser();
}

export function getLevelForPoints(points: number): string {
  return getLevelInfo(points).label;
}

export function syncStoredLevel(userId: string): void {
  const user = getUserById(userId);
  if (!user) return;
  const label = getLevelInfo(user.points).label;
  if (user.level !== label) {
    updateUser(userId, () => ({ level: label }));
  }
}

export function updateUser(
  userId: string,
  updater: (user: StoredUser) => Partial<StoredUser>,
): StoredUser | null {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index < 0) return null;
  const updated = { ...users[index], ...updater(users[index]) };
  users[index] = updated;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return updated;
}
