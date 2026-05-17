import { randomBytes } from "node:crypto";

export function generateInviteToken(): string {
  return randomBytes(18).toString("base64url");
}

export function appBaseUrl(): string {
  const fromEnv = process.env.APP_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const cors = process.env.CORS_ORIGIN?.split(",")[0]?.trim();
  if (cors) return cors.replace(/\/$/, "");
  return "http://localhost:5173";
}

export function pupilJoinUrl(inviteToken: string): string {
  return `${appBaseUrl()}/join/${inviteToken}`;
}
