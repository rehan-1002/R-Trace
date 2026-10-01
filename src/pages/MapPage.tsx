import './Page.css';
export function MapPage() {
  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Map</h1>
        <p className="page__subtitle">Node locations, incidents, and hazard overlays</p>
      </header>
      <div className="page__body">
        <div className="page__placeholder">
          <p>Leaflet operational map will appear here.</p>
          <p className="page__placeholder-note">Implemented in Phase 11.</p>
        </div>
      </div>
    </div>
  );
}
