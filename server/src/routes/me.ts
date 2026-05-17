import { Hono } from "hono";
import { prisma } from "../lib/db.js";
import type { AppVariables } from "../middleware/auth.js";
import { requireAuth } from "../middleware/auth.js";

export const meRoutes = new Hono<{ Variables: AppVariables }>();

meRoutes.use("*", requireAuth);

meRoutes.get("/", async (c) => {
  const auth = c.get("auth");
  const user = await prisma.user.findUnique({
    where: { id: auth.sub },
    include: { school: true },
  });
  if (!user) return c.json({ error: "User not found" }, 404);

  return c.json({
    id: user.id,
    username: user.username,
    firstName: user.firstName,
    yearGroup: user.yearGroup,
    points: user.points,
    level: user.level,
    role: user.role,
    schoolId: user.schoolId,
    schoolName: user.school?.name ?? null,
  });
});
