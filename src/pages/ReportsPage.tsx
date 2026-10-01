import './Page.css';

export function ReportsPage() {
  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Field Reports</h1>
        <p className="page__subtitle">Submit and review ground truth observations and evidence</p>
      </header>
      <div className="page__body">
        <div className="page__placeholder">
          <p>Field reporting intake, offline queue, and report review.</p>
          <p className="page__placeholder-note">Implemented in Phase 14 & 15.</p>
        </div>
      </div>
    </div>
  );
}
