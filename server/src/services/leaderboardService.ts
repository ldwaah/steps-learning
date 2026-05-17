import type { TeamColour } from "@prisma/client";
import { prisma } from "../lib/db.js";

export type TeamBoard = {
  colour: TeamColour;
  label: string;
  totalPoints: number;
  memberCount: number;
};

export type MemberBoardEntry = {
  userId: string;
  firstName: string;
  points: number;
  teamColour: TeamColour;
  isYou: boolean;
};

const TEAM_LABELS: Record<TeamColour, string> = {
  RED: "Red team",
  BLUE: "Blue team",
};

export async function getSchoolLeaderboard(schoolId: string, currentUserId: string) {
  const students = await prisma.user.findMany({
    where: {
      schoolId,
      role: "STUDENT",
      accountStatus: "APPROVED",
      active: true,
      teamColour: { not: null },
    },
    select: {
      id: true,
      firstName: true,
      points: true,
      teamColour: true,
    },
  });

  const yourTeam = students.find((s) => s.id === currentUserId)?.teamColour ?? null;

  const teams = (["RED", "BLUE"] as TeamColour[]).map((colour) => {
    const members = students.filter((s) => s.teamColour === colour);
    return {
      colour,
      label: TEAM_LABELS[colour],
      totalPoints: members.reduce((sum, m) => sum + m.points, 0),
      memberCount: members.length,
      isYourTeam: colour === yourTeam,
    };
  });

  teams.sort((a, b) => b.totalPoints - a.totalPoints);

  const members: MemberBoardEntry[] = students
    .map((s) => ({
      userId: s.id,
      firstName: s.firstName,
      points: s.points,
      teamColour: s.teamColour!,
      isYou: s.id === currentUserId,
    }))
    .sort((a, b) => b.points - a.points);

  return { teams, members, yourTeam };
}
