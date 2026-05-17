import type { ApiUser } from "./client";

const USER_KEY = "steps_api_user";
const STAFF_KEY = "steps_api_staff";

const STAFF_ROLES = new Set(["STAFF", "DSL", "SCHOOL_ADMIN", "TRUST_ADMIN"]);

export function setApiUser(user: ApiUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getApiUser(): ApiUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    const user = JSON.parse(raw) as ApiUser;
    if (STAFF_ROLES.has(user.role)) return null;
    return user;
  } catch {
    return null;
  }
}

export function clearApiUser(): void {
  localStorage.removeItem(USER_KEY);
}

export function setApiStaff(user: ApiUser): void {
  localStorage.setItem(STAFF_KEY, JSON.stringify(user));
}

export function getApiStaff(): ApiUser | null {
  const raw = localStorage.getItem(STAFF_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ApiUser;
  } catch {
    return null;
  }
}

export function clearApiStaff(): void {
  localStorage.removeItem(STAFF_KEY);
}

export function isStaffRole(role: string): boolean {
  return STAFF_ROLES.has(role);
}
