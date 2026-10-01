/**
 * auth.ts — Authentication and role types.
 * Roles are server-determined. Frontend reads; never writes.
 * From PRD.md section 10 and FRD.md sections 15-18.
 */

/** Roles are uppercase string literals matching backend JWT claims */
export type UserRole = 'ADMIN' | 'AUTHORITY' | 'WORKER' | 'CITIZEN';

/**
 * The authenticated user as returned from the login endpoint.
 * Role is embedded in the JWT but also returned in the login response
 * so the UI can immediately render the correct interface.
 */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Session {
  user: AuthUser;
  token: string;
  /** ISO 8601 expiry time */
  expiresAt: string;
}

/** Login request payload */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Login response from backend */
export interface LoginResponse {
  token: string;
  user: AuthUser;
  expiresAt: string;
}
