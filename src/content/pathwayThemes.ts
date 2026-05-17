import type { PathwayCategory } from "./types";

export type PathwayTheme = {
  icon: string;
  accent: string;
  accentSoft: string;
};

export const PATHWAY_THEMES: Record<string, PathwayTheme> = {
  "anger-shows-up": {
    icon: "◆",
    accent: "#c2410c",
    accentSoft: "rgba(194, 65, 12, 0.12)",
  },
  "worry-before-school": {
    icon: "○",
    accent: "#4f46e5",
    accentSoft: "rgba(79, 70, 229, 0.1)",
  },
  "asking-for-help": {
    icon: "▲",
    accent: "#0d9488",
    accentSoft: "rgba(13, 148, 136, 0.12)",
  },
  friendships: {
    icon: "●",
    accent: "#db2777",
    accentSoft: "rgba(219, 39, 119, 0.1)",
  },
  "calm-toolkit": {
    icon: "◇",
    accent: "#0891b2",
    accentSoft: "rgba(8, 145, 178, 0.12)",
  },
  "school-day": {
    icon: "■",
    accent: "#ca8a04",
    accentSoft: "rgba(202, 138, 4, 0.12)",
  },
};

const CATEGORY_WHY: Record<PathwayCategory, string> = {
  feelings: "Knowing your patterns helps you choose what happens next.",
  calm: "Practise once here so it is easier to use when you need it.",
  relationships: "These situations show up at school every week.",
  "school-life": "Small habits across the day add up.",
};

export function getPathwayTheme(pathwayId: string): PathwayTheme {
  return (
    PATHWAY_THEMES[pathwayId] ?? {
      icon: "•",
      accent: "#0d9488",
      accentSoft: "rgba(13, 148, 136, 0.1)",
    }
  );
}

export function defaultSessionWhy(category: PathwayCategory): string {
  return CATEGORY_WHY[category];
}
