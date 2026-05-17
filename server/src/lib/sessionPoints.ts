import {
  SESSION_BASE_POINTS,
  SESSION_BONUS_FROM_MS,
  SESSION_FULL_BONUS_AT_MS,
  SESSION_MAX_POINTS,
  SESSION_TIME_BONUS_MAX,
} from "./constants.js";

export type SessionPointsResult = {
  total: number;
  base: number;
  timeBonus: number;
  awarded: boolean;
  reason?: string;
};

export function calculateSessionPoints(
  durationMs: number,
  quizRequired: boolean,
  quizPassed: boolean,
): SessionPointsResult {
  if (quizRequired && !quizPassed) {
    return {
      total: 0,
      base: 0,
      timeBonus: 0,
      awarded: false,
      reason: "Quick check not passed",
    };
  }

  const base = SESSION_BASE_POINTS;
  let timeBonus = 0;

  if (durationMs >= SESSION_BONUS_FROM_MS) {
    const span = SESSION_FULL_BONUS_AT_MS - SESSION_BONUS_FROM_MS;
    const inBand = Math.min(durationMs - SESSION_BONUS_FROM_MS, span);
    timeBonus = Math.round((inBand / span) * SESSION_TIME_BONUS_MAX);
  }

  const total = Math.min(base + timeBonus, SESSION_MAX_POINTS);

  return { total, base, timeBonus, awarded: total > 0 };
}
