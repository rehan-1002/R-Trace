import './Page.css';

export function AdminPage() {
  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">System Administration</h1>
        <p className="page__subtitle">User provisioning, role assignments, edge gateway health, and audit logs</p>
      </header>
      <div className="page__body">
        <div className="page__placeholder">
          <p>System configuration, user management, and security audit records.</p>
          <p className="page__placeholder-note">Implemented in Phase 17.</p>
        </div>
      </div>
    </div>
  );
}
