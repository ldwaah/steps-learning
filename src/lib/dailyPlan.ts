import { DAILY_TARGET_MINUTES, listPathways } from "../content";
import { hasCheckedInToday } from "./checkin";
import { getCurrentBlock, getTopicSummary } from "./progress";
import { hasRegulatedToday } from "./regulate";
import { getSessionsCompletedToday } from "./sessionEvidence";

export type DailyPlanItem =
  | { kind: "check-in"; minutes: number; done: boolean }
  | { kind: "regulate"; minutes: number; done: boolean }
  | {
      kind: "session";
      topicId: string;
      pathwayTitle: string;
      sessionTitle: string;
      minutes: number;
    };

export type DailyPlan = {
  items: DailyPlanItem[];
  plannedMinutes: number;
  target: typeof DAILY_TARGET_MINUTES;
};

export type DailyPlanStatus = {
  plan: DailyPlan;
  checkInDone: boolean;
  regulateDone: boolean;
  sessionsDoneToday: number;
  sessionTarget: number;
  isComplete: boolean;
};

export function getDailyPlan(userId: string): DailyPlan {
  const items: DailyPlanItem[] = [];
  let plannedMinutes = 0;

  const checkDone = hasCheckedInToday(userId);
  items.push({ kind: "check-in", minutes: 5, done: checkDone });
  if (!checkDone) plannedMinutes += 5;

  const regDone = hasRegulatedToday(userId);
  items.push({ kind: "regulate", minutes: 5, done: regDone });
  if (!regDone) plannedMinutes += 5;

  const sessionCandidates: DailyPlanItem[] = [];

  for (const pathway of listPathways()) {
    const summary = getTopicSummary(userId, pathway.id);
    if (!summary || summary.isFinished) continue;
    const block = getCurrentBlock(userId, pathway.id);
    if (!block) continue;
    sessionCandidates.push({
      kind: "session",
      topicId: pathway.id,
      pathwayTitle: pathway.title,
      sessionTitle: block.title,
      minutes: pathway.minutesPerSession,
    });
  }

  for (const session of sessionCandidates) {
    if (plannedMinutes >= DAILY_TARGET_MINUTES.max) break;
    if (session.kind !== "session") continue;
    items.push(session);
    plannedMinutes += session.minutes;
    if (items.filter((i) => i.kind === "session").length >= 2) break;
  }

  return {
    items,
    plannedMinutes,
    target: DAILY_TARGET_MINUTES,
  };
}

export function getDailyPlanStatus(userId: string): DailyPlanStatus {
  const plan = getDailyPlan(userId);
  const checkInDone = hasCheckedInToday(userId);
  const regulateDone = hasRegulatedToday(userId);
  const sessionsDoneToday = getSessionsCompletedToday(userId);
  const sessionTarget = Math.max(
    1,
    plan.items.filter((i) => i.kind === "session").length,
  );
  const hasSessionWork = plan.items.some((i) => i.kind === "session");
  const sessionsOk = hasSessionWork
    ? sessionsDoneToday >= sessionTarget
    : sessionsDoneToday >= 1 ||
      listPathways().every(
        (p) => getTopicSummary(userId, p.id)?.isFinished ?? false,
      );

  return {
    plan,
    checkInDone,
    regulateDone,
    sessionsDoneToday,
    sessionTarget: hasSessionWork ? sessionTarget : 1,
    isComplete: checkInDone && regulateDone && sessionsOk,
  };
}
