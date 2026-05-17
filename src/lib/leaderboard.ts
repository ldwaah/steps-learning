import { getLevelForPoints } from "./levels";
import { getOverallStats } from "./progress";
import { getUsers } from "./storage";

export type LeaderboardEntry = {
  userId: string;
  firstName: string;
  points: number;
  levelLabel: string;
  sessionsCompleted: number;
  isYou: boolean;
};

/**
 * Local practice board, same device demo accounts only.
 * No class-wide league in v1 (SEMH-safe default).
 */
export function getLocalLeaderboard(currentUserId: string): LeaderboardEntry[] {
  return getUsers()
    .map((u) => {
      const stats = getOverallStats(u.id);
      return {
        userId: u.id,
        firstName: u.firstName,
        points: u.points,
        levelLabel: getLevelForPoints(u.points).label,
        sessionsCompleted: stats.sessionsCompleted,
        isYou: u.id === currentUserId,
      };
    })
    .sort((a, b) => b.points - a.points);
}

export function getYourRank(currentUserId: string): number {
  const board = getLocalLeaderboard(currentUserId);
  const idx = board.findIndex((e) => e.isYou);
  return idx < 0 ? 0 : idx + 1;
}
