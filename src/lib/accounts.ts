import { isApiMode } from "./api/config";
import { apiFetch } from "./api/client";
import type { TeamColour } from "./teams";
import {
  type StoredUser,
  generateLocalUsername,
  getUsers,
  saveUsers,
} from "./storage";

export type PendingStudent = {
  id: string;
  firstName: string;
  username: string;
  teamColour: TeamColour;
  createdAt: string;
};

export async function registerAccount(input: {
  schoolSlug?: string;
  firstName: string;
  teamColour: TeamColour;
  pin: string;
}): Promise<{ username: string; message: string }> {
  if (isApiMode()) {
    const data = await apiFetch<{ ok: boolean; username: string; message: string }>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify({
          schoolSlug: input.schoolSlug,
          firstName: input.firstName,
          teamColour: input.teamColour,
          pin: input.pin,
        }),
      },
    );
    return { username: data.username, message: data.message };
  }

  const username = generateLocalUsername(input.firstName);
  const users = getUsers();
  const id = `u_${Date.now()}`;
  const newUser: StoredUser = {
    id,
    username,
    pin: input.pin,
    firstName: input.firstName.trim(),
    yearGroup: 9,
    points: 0,
    level: "Getting started",
    teamColour: input.teamColour,
    accountStatus: "PENDING",
  };
  users.push(newUser);
  saveUsers(users);
  return {
    username,
    message: "Account created. Your teacher needs to approve it before you can sign in.",
  };
}

export function getPendingStudents(): PendingStudent[] {
  return getUsers()
    .filter((u) => u.accountStatus === "PENDING")
    .map((u) => ({
      id: u.id,
      firstName: u.firstName,
      username: u.username,
      teamColour: u.teamColour!,
      createdAt: new Date().toISOString(),
    }));
}

export function approveStudent(userId: string): void {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx < 0) return;
  users[idx] = { ...users[idx], accountStatus: "APPROVED" };
  saveUsers(users);
}

export function rejectStudent(userId: string): void {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx < 0) return;
  users[idx] = { ...users[idx], accountStatus: "REJECTED" };
  saveUsers(users);
}
