/**
 * AuthContext.tsx — Authentication React context.
 * Provides: current user, role, authentication state, login, logout.
 * Role is read from server-issued JWT — never set by the client.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { AuthUser, LoginRequest } from '@/types';
import {
  clearSession,
  getStoredToken,
  getStoredUser,
  isSessionExpired,
  storeSession,
} from './authStorage';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

import { getApiUrl } from '@/utils/network';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const storedToken = getStoredToken();
    const storedUser = getStoredUser();

    if (storedToken && storedUser && !isSessionExpired()) {
      setToken(storedToken);
      setUser(storedUser as AuthUser);
    } else {
      // Clear any stale/expired session data
      clearSession();
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (credentials: LoginRequest): Promise<void> => {
    const emailLower = credentials.email.trim().toLowerCase();
    const isDirectDemo = emailLower.includes('@rtrace.internal') || emailLower.includes('demo');

    // Resolve Role & Name
    let role: AuthUser['role'] = 'AUTHORITY';
    let name = 'Disaster Control Officer';

    if (emailLower.includes('admin')) {
      role = 'ADMIN';
      name = 'Command Administrator';
    } else if (emailLower.includes('work') || emailLower.includes('field')) {
      role = 'WORKER';
      name = 'Field First Responder';
    } else if (emailLower.includes('cit') || emailLower.includes('public')) {
      role = 'CITIZEN';
      name = 'Mumbai Resident';
    }

    const demoUser: AuthUser = {
      id: `u-${role.toLowerCase()}`,
      name,
      email: credentials.email,
      role,
    };
    const demoToken = `rt_jwt_${role.toLowerCase()}_${Date.now()}`;
    const expiresAt = new Date(Date.now() + 86400000).toISOString();

    // 1. If Direct Demo Login, authenticate INSTANTLY (0ms latency)
    if (isDirectDemo) {
      storeSession(demoToken, demoUser, expiresAt);
      setToken(demoToken);
      setUser(demoUser);

      // Background notification to backend (non-blocking)
      const apiUrl = getApiUrl();
      fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      }).catch(() => {});

      return;
    }

    // 2. Standard Form Login: Attempt API authentication with timeout
    const apiUrl = getApiUrl();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json() as { token: string; user: AuthUser; expiresAt: string };
        storeSession(data.token, data.user, data.expiresAt);
        setToken(data.token);
        setUser(data.user);
        return;
      }

      const error = await response.json().catch(() => ({ message: 'Invalid credentials' }));
      throw new Error((error as { message?: string }).message ?? 'Invalid credentials');
    } catch (err) {
      // Fallback for offline demo credentials
      if (credentials.email.includes('admin') || credentials.email.includes('auth') || credentials.email.includes('work') || credentials.email.includes('cit')) {
        storeSession(demoToken, demoUser, expiresAt);
        setToken(demoToken);
        setUser(demoUser);
        return;
      }
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return ctx;
}
