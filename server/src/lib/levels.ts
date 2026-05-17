const LEVELS = [
  { label: "Getting started", min: 0, max: 199 },
  { label: "Building momentum", min: 200, max: 499 },
  { label: "Going strong", min: 500, max: null as number | null },
];

export function levelLabelForPoints(points: number): string {
  if (points >= 500) return LEVELS[2].label;
  if (points >= 200) return LEVELS[1].label;
  return LEVELS[0].label;
}
