import { isApiMode } from "./api/config";
import { apiFetch } from "./api/client";
import { getLevelForPoints } from "./levels";
import { getOverallStats } from "./progress";
import { getUsers } from "./storage";
import type { TeamColour } from "./teams";
import { teamLabel } from "./teams";

export type LeaderboardEntry = {
  userId: string;
  firstName: string;
  points: number;
  levelLabel: string;
  sessionsCompleted: number;
  teamColour: TeamColour;
  isYou: boolean;
};

export type TeamLeaderboardEntry = {
  colour: TeamColour;
  label: string;
  totalPoints: number;
  memberCount: number;
  isYourTeam: boolean;
};

export type LeaderboardData = {
  teams: TeamLeaderboardEntry[];
  members: LeaderboardEntry[];
  yourTeam: TeamColour | null;
};

function localLeaderboard(currentUserId: string): LeaderboardData {
  const approved = getUsers().filter(
    (u) => u.accountStatus === "APPROVED" && u.teamColour,
  );
  const current = approved.find((u) => u.id === currentUserId);
  const yourTeam = current?.teamColour ?? null;

  const teams: TeamLeaderboardEntry[] = (["RED", "BLUE"] as TeamColour[]).map(
    (colour) => {
      const members = approved.filter((u) => u.teamColour === colour);
      return {
        colour,
        label: teamLabel(colour),
        totalPoints: members.reduce((s, m) => s + m.points, 0),
        memberCount: members.length,
        isYourTeam: colour === yourTeam,
      };
    },
  );
  teams.sort((a, b) => b.totalPoints - a.totalPoints);

  const members: LeaderboardEntry[] = approved
    .map((u) => {
      const stats = getOverallStats(u.id);
      return {
        userId: u.id,
        firstName: u.firstName,
        points: u.points,
        levelLabel: getLevelForPoints(u.points).label,
        sessionsCompleted: stats.sessionsCompleted,
        teamColour: u.teamColour!,
        isYou: u.id === currentUserId,
      };
    })
    .sort((a, b) => b.points - a.points);

  return { teams, members, yourTeam };
}

export async function fetchLeaderboard(
  currentUserId: string,
): Promise<LeaderboardData> {
  if (isApiMode()) {
    return apiFetch<LeaderboardData>("/student/leaderboard");
  }
  return localLeaderboard(currentUserId);
}

export function getYourRank(members: LeaderboardEntry[], currentUserId: string): number {
  const idx = members.findIndex((e) => e.userId === currentUserId);
  return idx < 0 ? 0 : idx + 1;
}

/** @deprecated use fetchLeaderboard */
export function getLocalLeaderboard(currentUserId: string): LeaderboardEntry[] {
  return localLeaderboard(currentUserId).members;
}
