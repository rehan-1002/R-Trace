/**
 * authStorage.ts — Token persistence in sessionStorage.
 * sessionStorage is cleared on tab close — safer than localStorage for JWTs.
 * NEVER use localStorage for the auth token.
 */

const TOKEN_KEY = 'rtrace_token';
const USER_KEY = 'rtrace_user';
const EXPIRES_KEY = 'rtrace_expires';

export function storeSession(token: string, user: object, expiresAt: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  sessionStorage.setItem(EXPIRES_KEY, expiresAt);
}

export function getStoredToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): object | null {
  const raw = sessionStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as object;
  } catch {
    return null;
  }
}

export function isSessionExpired(): boolean {
  const expiresAt = sessionStorage.getItem(EXPIRES_KEY);
  if (!expiresAt) return true;
  return new Date(expiresAt).getTime() < Date.now();
}

export function clearSession(): void {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(EXPIRES_KEY);
}
