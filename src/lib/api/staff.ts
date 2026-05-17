import { apiFetch } from "./client";
import type { PendingStudent } from "../accounts";
import type { LeaderboardData } from "../leaderboard";

export async function fetchPendingStudents(): Promise<PendingStudent[]> {
  const data = await apiFetch<{ pending: PendingStudent[] }>("/staff/pending");
  return data.pending;
}

export async function approveStudentApi(userId: string): Promise<void> {
  await apiFetch(`/staff/approve/${userId}`, { method: "POST", body: "{}" });
}

export async function rejectStudentApi(userId: string): Promise<void> {
  await apiFetch(`/staff/reject/${userId}`, { method: "POST", body: "{}" });
}

export async function fetchStaffLeaderboard(): Promise<LeaderboardData> {
  return apiFetch<LeaderboardData>("/staff/leaderboard");
}
