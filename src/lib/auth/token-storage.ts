import { STORAGE_KEYS } from "@/config/app";
import type { AuthTokens } from "@/types/auth";

function getStorage(persistent: boolean): Storage | null {
  if (typeof window === "undefined") return null;
  return persistent ? localStorage : sessionStorage;
}

export function getTokenStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  if (localStorage.getItem(STORAGE_KEYS.accessToken)) return localStorage;
  if (sessionStorage.getItem(STORAGE_KEYS.accessToken)) return sessionStorage;
  return null;
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem(STORAGE_KEYS.accessToken) ??
    sessionStorage.getItem(STORAGE_KEYS.accessToken)
  );
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem(STORAGE_KEYS.refreshToken) ??
    sessionStorage.getItem(STORAGE_KEYS.refreshToken)
  );
}

export function setTokens(tokens: AuthTokens, rememberMe = true): void {
  if (typeof window === "undefined") return;
  clearTokens();
  const storage = getStorage(rememberMe);
  if (!storage) return;
  storage.setItem(STORAGE_KEYS.accessToken, tokens.accessToken);
  storage.setItem(STORAGE_KEYS.refreshToken, tokens.refreshToken);
}

export function clearTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.accessToken);
  localStorage.removeItem(STORAGE_KEYS.refreshToken);
  sessionStorage.removeItem(STORAGE_KEYS.accessToken);
  sessionStorage.removeItem(STORAGE_KEYS.refreshToken);
}

export function hasStoredSession(): boolean {
  return !!getAccessToken();
}
