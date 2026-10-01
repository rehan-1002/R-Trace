/**
 * PublicPage.tsx — Public safety portal for citizens and guests.
 * Unauthenticated access: public alerts, safe zones, and hazard updates.
 * PRD.md section 10, FRD.md section 18.
 */

import { Link } from 'react-router-dom';
import './Page.css';

export function PublicPage() {
  return (
    <div className="page" style={{ maxWidth: '960px', margin: '0 auto', width: '100%' }}>
      <header className="page__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page__title">R-TRACE Public Safety Portal</h1>
          <p className="page__subtitle">Live environmental risk notices and verified community safety information</p>
        </div>
        <Link
          to="/login"
          style={{
            padding: 'var(--space-2) var(--space-4)',
            backgroundColor: 'var(--color-surface-raised)',
            border: '1px solid var(--color-surface-border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-text-primary)',
            fontSize: 'var(--font-size-sm)',
            textDecoration: 'none',
          }}
        >
          Sign in
        </Link>
      </header>

      <div className="page__body">
        <div className="page__placeholder">
          <p>Public hazard alerts, community safety corridors, and verified shelter locations.</p>
          <p className="page__placeholder-note">Implemented in Phase 16 (Citizen + Guest experience).</p>
        </div>
      </div>
    </div>
  );
}
