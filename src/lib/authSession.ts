import { clearAuditCache } from "./api/auditCache";
import { clearProgressCache } from "./api/progressCache";
import {
  clearApiStaff,
  clearApiUser,
  getApiStaff,
  getApiUser,
  isStaffRole,
} from "./api/session";
import { apiLogout } from "./api/client";
import { isApiMode } from "./api/config";
import type { TeamColour } from "./teams";
import {
  clearSession,
  getLocalSessionUser,
  getSession,
  getUserById,
  isStaffSession,
  setStaffSession,
  type StoredUser,
} from "./storage";

/** Current signed-in student (local pilot or API trust mode). */
export function getCurrentUser(): StoredUser | null {
  if (isApiMode()) {
    const api = getApiUser();
    if (!api || api.role !== "STUDENT") return null;
    return mapApiUserToStored(api);
  }
  return getLocalSessionUser();
}

export function getCurrentStaff(): { id: string; firstName: string; schoolName: string | null } | null {
  if (isApiMode()) {
    const api = getApiStaff();
    if (!api) return null;
    return {
      id: api.id,
      firstName: api.firstName,
      schoolName: api.schoolName,
    };
  }
  if (isStaffSession()) {
    return { id: "local-staff", firstName: "Teacher", schoolName: "Local" };
  }
  return null;
}

export function signOut(): void {
  if (isApiMode()) {
    apiLogout();
    clearApiUser();
    clearApiStaff();
    clearProgressCache();
    clearAuditCache();
    return;
  }
  clearSession();
  setStaffSession(false);
}

export function isAuthenticated(): boolean {
  if (isApiMode()) return getApiUser() !== null;
  return getSession() !== null;
}

export function isStaffAuthenticated(): boolean {
  if (isApiMode()) return getApiStaff() !== null;
  return isStaffSession();
}

export function getCurrentUserId(): string | null {
  return getCurrentUser()?.id ?? null;
}

export function mapApiUserToStored(api: {
  id: string;
  username: string;
  firstName: string;
  yearGroup: number | null;
  points: number;
  level: string;
  teamColour?: TeamColour | null;
}): StoredUser {
  return {
    id: api.id,
    username: api.username,
    pin: "",
    firstName: api.firstName,
    yearGroup: (api.yearGroup ?? 9) as StoredUser["yearGroup"],
    points: api.points,
    level: api.level,
    teamColour: api.teamColour ?? "RED",
    accountStatus: "APPROVED",
  };
}

export { getUserById, isStaffRole };
