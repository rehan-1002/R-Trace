/**
 * Header.tsx — Application header.
 * Shows: R-TRACE wordmark, system status, user account.
 * DESIGN.md section 6 — Header / system state / account.
 */

import { useAuth } from '@/auth/useAuth';
import './Header.css';

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="header" role="banner">
      <div className="header__brand">
        <span className="header__wordmark">R-TRACE</span>
      </div>

      <div className="header__account">
        {user && (
          <>
            <span className="header__user-name">{user.name}</span>
            <span className="header__user-role">{user.role}</span>
            <button
              className="header__logout"
              onClick={logout}
              type="button"
              aria-label="Sign out"
            >
              Sign out
            </button>
          </>
        )}
      </div>
    </header>
  );
}
