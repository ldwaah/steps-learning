import { Hono } from "hono";
import { prisma } from "../lib/db.js";
import type { AppVariables } from "../middleware/auth.js";
import { requireAuth, requireRoles } from "../middleware/auth.js";

export const trustRoutes = new Hono<{ Variables: AppVariables }>();

trustRoutes.use("*", requireAuth);
trustRoutes.use("*", requireRoles("TRUST_ADMIN", "DSL", "SCHOOL_ADMIN", "STAFF"));

/** Trust-wide engagement summary (school rollup). */
trustRoutes.get("/schools/summary", async (c) => {
  const auth = c.get("auth");

  const schools = await prisma.school.findMany({
    where: {
      trustId: auth.trustId ?? undefined,
      ...(auth.role === "SCHOOL_ADMIN" && auth.schoolId
        ? { id: auth.schoolId }
        : {}),
    },
    orderBy: { name: "asc" },
  });

  const since = new Date();
  since.setDate(since.getDate() - 7);

  const summaries = await Promise.all(
    schools.map(async (school) => {
      const studentIds = (
        await prisma.user.findMany({
          where: { schoolId: school.id, role: "STUDENT", active: true },
          select: { id: true },
        })
      ).map((u) => u.id);

      const sessionsLast7d =
        studentIds.length === 0
          ? 0
          : await prisma.sessionCompletion.count({
              where: {
                userId: { in: studentIds },
                completedAt: { gte: since },
                pointsAwarded: true,
              },
            });

      const checkInsLast7d =
        studentIds.length === 0
          ? 0
          : await prisma.checkIn.count({
              where: {
                userId: { in: studentIds },
                createdAt: { gte: since },
              },
            });

      const activeStudents = await prisma.user.count({
        where: { schoolId: school.id, role: "STUDENT", active: true },
      });

      return {
        schoolId: school.id,
        name: school.name,
        slug: school.slug,
        activeStudents,
        sessionsLast7d,
        checkInsLast7d,
      };
    }),
  );

  return c.json({ schools: summaries });
});
