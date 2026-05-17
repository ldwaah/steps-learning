import { isApiMode } from "./api/config";
import {
  getAuditCache,
  prependAuditEvent,
  setAuditCache,
} from "./api/auditCache";
import { apiFetchAudit, apiPostAudit } from "./api/student";

export type AuditCategory = "auth" | "wellbeing" | "learning" | "points";

export type AuditEventType =
  | "auth.login"
  | "auth.logout"
  | "auth.login_failed"
  | "wellbeing.check_in"
  | "wellbeing.regulate"
  | "learning.session_start"
  | "learning.session_complete"
  | "learning.pathway_complete"
  | "points.earned";

export type AuditEvent = {
  id: string;
  userId: string;
  type: AuditEventType;
  category: AuditCategory;
  timestamp: string;
  summary: string;
  detail?: string;
  pointsDelta?: number;
  meta?: Record<string, string | number | boolean>;
};

type AuditInput = {
  userId: string;
  type: AuditEventType;
  summary: string;
  detail?: string;
  pointsDelta?: number;
  meta?: Record<string, string | number | boolean>;
};

const AUDIT_KEY = "steps_audit_log";
const MAX_EVENTS = 1000;

const TYPE_CATEGORY: Record<AuditEventType, AuditCategory> = {
  "auth.login": "auth",
  "auth.logout": "auth",
  "auth.login_failed": "auth",
  "wellbeing.check_in": "wellbeing",
  "wellbeing.regulate": "wellbeing",
  "learning.session_start": "learning",
  "learning.session_complete": "learning",
  "learning.pathway_complete": "learning",
  "points.earned": "points",
};

function readAll(): AuditEvent[] {
  const raw = localStorage.getItem(AUDIT_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as AuditEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(events: AuditEvent[]): void {
  localStorage.setItem(AUDIT_KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
}

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function logAudit(input: AuditInput): AuditEvent {
  const event: AuditEvent = {
    id: newId(),
    userId: input.userId,
    type: input.type,
    category: TYPE_CATEGORY[input.type],
    timestamp: new Date().toISOString(),
    summary: input.summary,
    detail: input.detail,
    pointsDelta: input.pointsDelta,
    meta: input.meta,
  };

  if (isApiMode()) {
    if (input.userId !== GUEST_USER_ID) {
      prependAuditEvent(event);
      void apiPostAudit({
        type: event.type,
        category: event.category,
        summary: event.summary,
        detail: event.detail,
        pointsDelta: event.pointsDelta,
        meta: event.meta,
      }).catch(() => {});
    }
    return event;
  }

  const events = readAll();
  events.push(event);
  writeAll(events);
  return event;
}

export function getAuditEvents(
  userId: string,
  options?: { limit?: number; category?: AuditCategory },
): AuditEvent[] {
  let list = isApiMode()
    ? getAuditCache().filter((e) => e.userId === userId)
    : readAll().filter((e) => e.userId === userId);
  list = [...list].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  if (options?.category) {
    list = list.filter((e) => e.category === options.category);
  }
  if (options?.limit) list = list.slice(0, options.limit);
  return list;
}

export type AuditDayGroup = {
  dateKey: string;
  label: string;
  events: AuditEvent[];
};

export function getAuditByDay(userId: string, limit = 200): AuditDayGroup[] {
  const events = getAuditEvents(userId, { limit });
  const map = new Map<string, AuditEvent[]>();

  for (const event of events) {
    const dateKey = event.timestamp.slice(0, 10);
    const bucket = map.get(dateKey) ?? [];
    bucket.push(event);
    map.set(dateKey, bucket);
  }

  return [...map.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([dateKey, dayEvents]) => ({
      dateKey,
      label: dayLabel(dateKey),
      events: dayEvents.sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    }));
}

function dayLabel(dateKey: string): string {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (dateKey === today) return "Today";
  if (dateKey === yesterday) return "Yesterday";
  const d = new Date(`${dateKey}T12:00:00`);
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatAuditTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getAuditStats(userId: string): {
  total: number;
  today: number;
  pointsEarned: number;
  sessionsCompleted: number;
} {
  const events = getAuditEvents(userId);
  const today = new Date().toISOString().slice(0, 10);
  let pointsEarned = 0;
  let sessionsCompleted = 0;

  for (const e of events) {
    if (e.timestamp.startsWith(today)) {
      /* counted below */
    }
    if (e.pointsDelta && e.pointsDelta > 0) pointsEarned += e.pointsDelta;
    if (e.type === "learning.session_complete") sessionsCompleted += 1;
  }

  return {
    total: events.length,
    today: events.filter((e) => e.timestamp.startsWith(today)).length,
    pointsEarned,
    sessionsCompleted,
  };
}

export function exportAuditJson(userId: string): string {
  return JSON.stringify(getAuditEvents(userId), null, 2);
}

export async function refreshAuditFromServer(_userId: string): Promise<void> {
  if (!isApiMode()) return;
  const data = await apiFetchAudit(200);
  setAuditCache(
    data.events.map((e) => ({
      id: e.id,
      userId: e.userId,
      type: e.type as AuditEventType,
      category: e.category as AuditCategory,
      timestamp: e.timestamp,
      summary: e.summary,
      detail: e.detail,
      pointsDelta: e.pointsDelta,
      meta: e.meta,
    })),
  );
}

export const GUEST_USER_ID = "_guest";

export function getAllAuditEventsForStaff(limit = 500): AuditEvent[] {
  return readAll()
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, limit);
}

export function exportAllAuditJson(): string {
  return JSON.stringify(getAllAuditEventsForStaff(1000), null, 2);
}

export const CATEGORY_LABELS: Record<AuditCategory, string> = {
  auth: "Sign in",
  wellbeing: "Wellbeing",
  learning: "Sessions",
  points: "Points",
};
