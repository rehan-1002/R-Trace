import './Page.css';
export function AlertsPage() {
  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Alerts</h1>
        <p className="page__subtitle">Active alerts — role-filtered</p>
      </header>
      <div className="page__body">
        <div className="page__placeholder">
          <p>Alert feed will appear here. Alerts are push-delivered via WebSocket.</p>
          <p className="page__placeholder-note">Implemented in Phase 10.</p>
        </div>
      </div>
    </div>
  );
}
