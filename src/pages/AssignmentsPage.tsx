import './Page.css';
export function AssignmentsPage() {
  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Assignments</h1>
        <p className="page__subtitle">Your current task assignments</p>
      </header>
      <div className="page__body">
        <div className="page__placeholder">
          <p>Worker assignments and task queue will appear here.</p>
          <p className="page__placeholder-note">Implemented in Phase 14.</p>
        </div>
      </div>
    </div>
  );
}
