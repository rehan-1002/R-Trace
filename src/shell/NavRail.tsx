/**
 * NavRail.tsx — Role-adaptive navigation rail.
 * Shows only the navigation items permitted for the current user's role.
 * DESIGN.md section 6 — Navigation Rail.
 * RULES.md section 9 — adaptive UI rules.
 */

import { NavLink } from 'react-router-dom';
import { useAuth } from '@/auth/useAuth';
import type { UserRole } from '@/types';
import './NavRail.css';

interface NavItem {
  path: string;
  label: string;
  /** Roles that can see this nav item. Empty = all authenticated roles. */
  roles?: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/nodes', label: 'Nodes' },
  { path: '/incidents', label: 'Incidents', roles: ['ADMIN', 'AUTHORITY', 'WORKER'] },
  { path: '/alerts', label: 'Alerts' },
  { path: '/map', label: 'Map' },
  { path: '/assignments', label: 'Assignments', roles: ['WORKER'] },
  { path: '/reports', label: 'Field Reports', roles: ['WORKER', 'AUTHORITY', 'ADMIN'] },
  { path: '/operations', label: 'Operations', roles: ['AUTHORITY', 'ADMIN'] },
  { path: '/safe-zones', label: 'Safe Zones', roles: ['CITIZEN', 'WORKER', 'AUTHORITY'] },
  { path: '/admin', label: 'System Admin', roles: ['ADMIN'] },
];

export function NavRail() {
  const { user } = useAuth();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <nav className="nav-rail" aria-label="Primary navigation">
      <ul className="nav-rail__list" role="list">
        {visibleItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `nav-rail__item${isActive ? ' nav-rail__item--active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
