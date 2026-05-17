import { prisma } from "../lib/db.js";

export async function appendAudit(input: {
  userId: string;
  type: string;
  category: string;
  summary: string;
  detail?: string;
  pointsDelta?: number;
  meta?: Record<string, string | number | boolean>;
}) {
  return prisma.auditEvent.create({
    data: {
      userId: input.userId,
      type: input.type,
      category: input.category,
      summary: input.summary,
      detail: input.detail,
      pointsDelta: input.pointsDelta,
      meta: input.meta ? JSON.stringify(input.meta) : null,
    },
  });
}
