export type TeamColour = "RED" | "BLUE";

export type AccountStatus = "PENDING" | "APPROVED" | "REJECTED";

export const TEAM_OPTIONS: { id: TeamColour; label: string; cssVar: string }[] = [
  { id: "RED", label: "Red team", cssVar: "var(--team-red)" },
  { id: "BLUE", label: "Blue team", cssVar: "var(--team-blue)" },
];

export function teamLabel(colour: TeamColour): string {
  return TEAM_OPTIONS.find((t) => t.id === colour)?.label ?? colour;
}
