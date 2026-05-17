import type { AuditEvent } from "../audit";

let events: AuditEvent[] = [];

export function setAuditCache(list: AuditEvent[]): void {
  events = list;
}

export function clearAuditCache(): void {
  events = [];
}

export function getAuditCache(): AuditEvent[] {
  return events;
}

export function prependAuditEvent(event: AuditEvent): void {
  events = [event, ...events].slice(0, 500);
}
