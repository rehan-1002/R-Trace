/**
 * RoleGuard.tsx — Renders children only if the user has the required role(s).
 * Frontend visibility guard only — server still enforces permissions independently.
 * RULES.md section 10: server determines roles.
 */

import type { ReactNode } from 'react';
import type { UserRole } from '@/types';
import { useAuth } from './useAuth';

interface RoleGuardProps {
  roles: UserRole[];
  children: ReactNode;
  /** What to render when the role check fails. Defaults to nothing. */
  fallback?: ReactNode;
}

export function RoleGuard({ roles, children, fallback = null }: RoleGuardProps) {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
