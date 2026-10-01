import './Page.css';
export function IncidentsPage() {
  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Incidents</h1>
        <p className="page__subtitle">Active and historical incidents</p>
      </header>
      <div className="page__body">
        <div className="page__placeholder">
          <p>Incident list and lifecycle management will appear here.</p>
          <p className="page__placeholder-note">Implemented in Phase 10.</p>
        </div>
      </div>
    </div>
  );
}
