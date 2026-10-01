import './Page.css';

export function SettingsPage() {
  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Settings</h1>
        <p className="page__subtitle">Operational preferences, alert thresholds, and offline storage management</p>
      </header>
      <div className="page__body">
        <div className="page__placeholder">
          <p>User preferences and local storage diagnostic tools.</p>
        </div>
      </div>
    </div>
  );
}
