export type LevelId = "starter" | "building" | "going-strong";

export type LevelInfo = {
  id: LevelId;
  label: string;
  shortLabel: string;
  minPoints: number;
  maxPoints: number | null;
  studentDescription: string;
};

export const LEVELS: LevelInfo[] = [
  {
    id: "starter",
    label: "Getting started",
    shortLabel: "Stage 1",
    minPoints: 0,
    maxPoints: 199,
    studentDescription: "You're beginning. Keep showing up.",
  },
  {
    id: "building",
    label: "Building momentum",
    shortLabel: "Stage 2",
    minPoints: 200,
    maxPoints: 499,
    studentDescription: "You're back regularly. Effort counts.",
  },
  {
    id: "going-strong",
    label: "Going strong",
    shortLabel: "Stage 3",
    minPoints: 500,
    maxPoints: null,
    studentDescription: "You've put the time in. Keep your pace.",
  },
];

export function getLevelForPoints(points: number): LevelInfo {
  if (points >= 500) return LEVELS[2];
  if (points >= 200) return LEVELS[1];
  return LEVELS[0];
}

export function getNextLevel(points: number): LevelInfo | null {
  const current = getLevelForPoints(points);
  const idx = LEVELS.findIndex((l) => l.id === current.id);
  return LEVELS[idx + 1] ?? null;
}

export function pointsToNextLevel(points: number): number | null {
  const next = getNextLevel(points);
  if (!next) return null;
  return next.minPoints - points;
}

export function getLegacyLevelLabel(points: number): string {
  return getLevelForPoints(points).label;
}
