import type { ApiUser } from "./client";

const USER_KEY = "steps_api_user";

export function setApiUser(user: ApiUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getApiUser(): ApiUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ApiUser;
  } catch {
    return null;
  }
}

export function clearApiUser(): void {
  localStorage.removeItem(USER_KEY);
}
