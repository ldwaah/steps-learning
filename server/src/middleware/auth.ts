import type { Context, Next } from "hono";
import { verifyToken, type AuthTokenPayload } from "../lib/auth.js";

export type AppVariables = {
  auth: AuthTokenPayload;
};

export async function requireAuth(c: Context<{ Variables: AppVariables }>, next: Next) {
  const header = c.req.header("Authorization");
  if (!header?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  try {
    const auth = await verifyToken(header.slice(7));
    c.set("auth", auth);
    await next();
  } catch {
    return c.json({ error: "Invalid or expired session" }, 401);
  }
}

export function requireRoles(...roles: AuthTokenPayload["role"][]) {
  return async (c: Context<{ Variables: AppVariables }>, next: Next) => {
    const auth = c.get("auth");
    if (!roles.includes(auth.role)) {
      return c.json({ error: "Forbidden" }, 403);
    }
    await next();
  };
}
