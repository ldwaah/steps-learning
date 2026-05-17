import { clearAuditCache } from "./api/auditCache";
import { clearProgressCache } from "./api/progressCache";
import { clearApiUser, getApiUser } from "./api/session";
import { apiLogout } from "./api/client";
import { isApiMode } from "./api/config";
import {
  clearSession,
  getLocalSessionUser,
  getSession,
  getUserById,
  type StoredUser,
} from "./storage";

/** Current signed-in student (local pilot or API trust mode). */
export function getCurrentUser(): StoredUser | null {
  if (isApiMode()) {
    const api = getApiUser();
    if (!api || api.role !== "STUDENT") return null;
    return {
      id: api.id,
      username: api.username,
      pin: "",
      firstName: api.firstName,
      yearGroup: (api.yearGroup ?? 9) as StoredUser["yearGroup"],
      points: api.points,
      level: api.level,
    };
  }
  return getLocalSessionUser();
}

export function signOut(): void {
  if (isApiMode()) {
    apiLogout();
    clearApiUser();
    clearProgressCache();
    clearAuditCache();
    return;
  }
  clearSession();
}

export function isAuthenticated(): boolean {
  if (isApiMode()) return getApiUser() !== null;
  return getSession() !== null;
}

export function getCurrentUserId(): string | null {
  return getCurrentUser()?.id ?? null;
}

/** Refresh local reference after API login (maps API user to StoredUser shape). */
export function mapApiUserToStored(api: {
  id: string;
  username: string;
  firstName: string;
  yearGroup: number | null;
  points: number;
  level: string;
}): StoredUser {
  return {
    id: api.id,
    username: api.username,
    pin: "",
    firstName: api.firstName,
    yearGroup: (api.yearGroup ?? 9) as StoredUser["yearGroup"],
    points: api.points,
    level: api.level,
  };
}

export { getUserById };
