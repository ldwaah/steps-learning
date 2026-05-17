export type DataMode = "local" | "api";

export function getDataMode(): DataMode {
  const mode = import.meta.env.VITE_DATA_MODE;
  return mode === "api" ? "api" : "local";
}

export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_URL ?? "/api";
}

export function isApiMode(): boolean {
  return getDataMode() === "api";
}
