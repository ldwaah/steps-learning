import { getApiBaseUrl } from "./config";

const TOKEN_KEY = "steps_api_token";

export type ApiUser = {
  id: string;
  username: string;
  firstName: string;
  yearGroup: number | null;
  points: number;
  level: string;
  role: string;
  schoolId: string | null;
  schoolName: string | null;
};

export type LoginResult = {
  token: string;
  user: ApiUser;
};

export function getApiToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setApiToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export async function apiLogin(
  schoolSlug: string,
  username: string,
  pin: string,
): Promise<LoginResult> {
  const res = await fetch(`${getApiBaseUrl()}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ schoolSlug, username, pin }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Login failed");
  setApiToken(data.token);
  return data as LoginResult;
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const token = getApiToken();
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data as T;
}

export function apiLogout(): void {
  setApiToken(null);
}
