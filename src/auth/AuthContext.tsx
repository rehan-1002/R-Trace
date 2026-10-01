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
    const isMockMode = import.meta.env.VITE_DATA_MODE === 'mock';
    const apiUrl = import.meta.env.VITE_API_URL as string;

    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const data = await response.json() as { token: string; user: AuthUser; expiresAt: string };
        storeSession(data.token, data.user, data.expiresAt);
        setToken(data.token);
        setUser(data.user);
        return;
      }

      if (!isMockMode) {
        const error = await response.json().catch(() => ({ message: 'Login failed' }));
        throw new Error((error as { message?: string }).message ?? 'Login failed');
      }
    } catch (err) {
      if (!isMockMode) {
        throw err;
      }
    }

    // Mock Mode Fallback: Generate valid demo user session
    const emailLower = credentials.email.toLowerCase();
    let role: AuthUser['role'] = 'AUTHORITY';
    let name = 'Disaster Management Officer';

    if (emailLower.includes('admin')) {
      role = 'ADMIN';
      name = 'System Administrator';
    } else if (emailLower.includes('worker') || emailLower.includes('field')) {
      role = 'WORKER';
      name = 'Field Responder Alpha';
    } else if (emailLower.includes('citizen')) {
      role = 'CITIZEN';
      name = 'Local Resident';
    }

    const mockUser: AuthUser = {
      id: `usr-${role.toLowerCase()}-01`,
      name,
      email: credentials.email,
      role,
    };
    const mockToken = `mock-jwt-${role.toLowerCase()}-${Date.now()}`;
    const expiresAt = new Date(Date.now() + 86400000).toISOString();

    storeSession(mockToken, mockUser, expiresAt);
    setToken(mockToken);
    setUser(mockUser);
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
