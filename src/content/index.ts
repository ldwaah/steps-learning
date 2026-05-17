import { angerShowsUp } from "./pathways/anger-shows-up";
import { askingForHelp } from "./pathways/asking-for-help";
import { calmToolkit } from "./pathways/calm-toolkit";
import { friendships } from "./pathways/friendships";
import { schoolDay } from "./pathways/school-day";
import { worryBeforeSchool } from "./pathways/worry-before-school";
import type { PathwayCategory, PathwayData } from "./types";

const PATHWAYS: Record<string, PathwayData> = {
  [angerShowsUp.id]: angerShowsUp,
  [worryBeforeSchool.id]: worryBeforeSchool,
  [askingForHelp.id]: askingForHelp,
  [friendships.id]: friendships,
  [calmToolkit.id]: calmToolkit,
  [schoolDay.id]: schoolDay,
};

export { getPathwayTheme, PATHWAY_THEMES } from "./pathwayThemes";

export const CATEGORY_LABELS: Record<PathwayCategory, string> = {
  feelings: "Feelings",
  relationships: "You & others",
  calm: "Calm & reset",
  "school-life": "School life",
};

export function getTopic(id: string): PathwayData | null {
  return PATHWAYS[id] ?? null;
}

export function getPathway(id: string): PathwayData | null {
  return getTopic(id);
}

export function listTopics(): PathwayData[] {
  return Object.values(PATHWAYS);
}

export function listPathways(): PathwayData[] {
  return listTopics();
}

export function listPathwaysByCategory(): {
  category: PathwayCategory;
  label: string;
  pathways: PathwayData[];
}[] {
  const order: PathwayCategory[] = [
    "feelings",
    "calm",
    "relationships",
    "school-life",
  ];
  return order.map((category) => ({
    category,
    label: CATEGORY_LABELS[category],
    pathways: listPathways().filter((p) => p.category === category),
  }));
}

export function getSessionCount(pathway: PathwayData): number {
  return pathway.blocks.length;
}

export function getEstimatedMinutes(pathway: PathwayData): number {
  return pathway.blocks.length * pathway.minutesPerSession;
}

/** Target active time spread across a school day */
export const DAILY_TARGET_MINUTES = { min: 40, max: 60 };

/** Session: base for completing + pass on quick check; bonus scales with time (max below). */
export const SESSION_BASE_POINTS = 10;
export const SESSION_TIME_BONUS_MAX = 10;
export const SESSION_MAX_POINTS = SESSION_BASE_POINTS + SESSION_TIME_BONUS_MAX;

/** @deprecated Use SESSION_MAX_POINTS — shown as “up to” on Progress. */
export const BLOCK_POINTS = SESSION_MAX_POINTS;
export const CHECK_IN_POINTS = 5;
export const REGULATE_POINTS = 5;
