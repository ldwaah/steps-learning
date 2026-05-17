import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import type { UserRole } from "@prisma/client";

const JWT_ISSUER = "steps-trust";
const JWT_AUDIENCE = "steps-app";

export type AuthTokenPayload = {
  sub: string;
  role: UserRole;
  schoolId: string | null;
  trustId: string | null;
};

function secretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 10);
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}

export async function signToken(payload: AuthTokenPayload): Promise<string> {
  return new SignJWT({
    role: payload.role,
    schoolId: payload.schoolId,
    trustId: payload.trustId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secretKey());
}

export async function verifyToken(token: string): Promise<AuthTokenPayload> {
  const { payload } = await jwtVerify(token, secretKey(), {
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });
  const sub = payload.sub;
  if (!sub) throw new Error("Invalid token");
  return {
    sub,
    role: payload.role as UserRole,
    schoolId: (payload.schoolId as string | null) ?? null,
    trustId: (payload.trustId as string | null) ?? null,
  };
}
