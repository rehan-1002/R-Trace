import './Page.css';

export function SafeZonesPage() {
  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Safe Zones & Shelters</h1>
        <p className="page__subtitle">Designated assembly areas, relief camps, and safe evacuation corridors</p>
      </header>
      <div className="page__body">
        <div className="page__placeholder">
          <p>Verified evacuation sites, operational status, and capacity.</p>
          <p className="page__placeholder-note">Implemented in Phase 16.</p>
        </div>
      </div>
    </div>
  );
}
