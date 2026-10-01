/**
 * AppShell.tsx — Root application layout container.
 * Composes: Header + StatusStrip + NavRail + Main workspace + ContextPanel.
 * DESIGN.md section 6 — three-region layout.
 */

import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { StatusStrip } from './StatusStrip';
import { NavRail } from './NavRail';
import { ContextPanel } from './ContextPanel';
import './AppShell.css';

export function AppShell() {
  const dataMode = import.meta.env.VITE_DATA_MODE as string;

  return (
    <div className="app-shell">
      <div className="app-shell__header">
        <Header />
      </div>

      <div className="app-shell__status">
        <StatusStrip dataMode={dataMode} />
      </div>

      <div className="app-shell__nav">
        <NavRail />
      </div>

      <main className="app-shell__main" id="main-content" tabIndex={-1}>
        <Outlet />
      </main>

      <div className="app-shell__context">
        <ContextPanel />
      </div>
    </div>
  );
}
