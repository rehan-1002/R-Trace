import { Link } from 'react-router-dom';
import './Page.css';

export function NotFoundPage() {
  return (
    <div className="page" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', maxWidth: '400px', padding: 'var(--space-8)' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
          404
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>
          Requested operational view not found.
        </p>
        <Link
          to="/dashboard"
          style={{
            display: 'inline-block',
            padding: 'var(--space-2) var(--space-4)',
            backgroundColor: 'var(--color-surface-raised)',
            border: '1px solid var(--color-surface-border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-text-primary)',
            fontSize: 'var(--font-size-sm)',
            textDecoration: 'none',
          }}
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
