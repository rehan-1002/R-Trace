/**
 * RouteGuard.tsx — Protects routes that require authentication.
 * Redirects unauthenticated users to the login page.
 * Shows a loading state while session is being restored.
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

export function RouteGuard() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Avoid flash of login page while session restores from sessionStorage
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100dvh',
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--font-size-sm)',
          background: 'var(--color-surface-base)',
        }}
        aria-label="Loading session"
      >
        Loading…
      </div>
    );
  }

  if (!isAuthenticated) {
    // Preserve the intended destination so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
