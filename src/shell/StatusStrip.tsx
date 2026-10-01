/**
 * StatusStrip.tsx — Connection state indicator strip.
 * Shows edge/cloud connectivity state and last-seen times.
 * Uses direct primitive selectors to prevent infinite re-render loops.
 * RULES.md section 7, DESIGN.md section 9 (state design).
 * This component must NEVER show stale state as live/green.
 */

import { useConnectionStore } from '@/stores/connection';
import './StatusStrip.css';

interface StatusStripProps {
  edgeStatus?: 'connected' | 'disconnected' | 'unknown';
  cloudStatus?: 'connected' | 'disconnected' | 'unknown';
  lastEdgeSeen?: string | null;
  dataMode?: string;
}

export function StatusStrip({
  edgeStatus: propEdgeStatus,
  cloudStatus: propCloudStatus,
  lastEdgeSeen: propLastEdgeSeen,
  dataMode,
}: StatusStripProps) {
  const storeEdge = useConnectionStore((s) => s.edgeStatus);
  const storeCloud = useConnectionStore((s) => s.cloudStatus);
  const storeLastEdge = useConnectionStore((s) => s.lastEdgeSeen);

  const edgeStatus = propEdgeStatus ?? storeEdge;
  const cloudStatus = propCloudStatus ?? storeCloud;
  const lastEdgeSeen = propLastEdgeSeen ?? storeLastEdge;
  const isDemoMode = (dataMode ?? import.meta.env.VITE_DATA_MODE) === 'mock';

  return (
    <div className="status-strip" role="status" aria-label="System connection status">
      <div className="status-strip__items">
        {isDemoMode && (
          <span className="status-strip__demo-badge" aria-label="Demo mode active">
            DEMO MODE
          </span>
        )}

        <StatusDot
          label="Edge"
          status={edgeStatus}
          lastSeen={lastEdgeSeen}
        />

        <StatusDot
          label="Cloud"
          status={cloudStatus}
        />
      </div>
    </div>
  );
}

interface StatusDotProps {
  label: string;
  status: 'connected' | 'disconnected' | 'unknown';
  lastSeen?: string | null;
}

function StatusDot({ label, status, lastSeen }: StatusDotProps) {
  const statusLabel =
    status === 'connected'
      ? 'Connected'
      : status === 'disconnected'
        ? 'Disconnected'
        : 'Unknown';

  const formattedLastSeen = lastSeen
    ? new Date(lastSeen).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : null;

  return (
    <span
      className={`status-dot status-dot--${status}`}
      title={formattedLastSeen ? `Last seen: ${formattedLastSeen}` : undefined}
      aria-label={`${label}: ${statusLabel}${formattedLastSeen ? `, last seen ${formattedLastSeen}` : ''}`}
    >
      <span className="status-dot__indicator" aria-hidden="true" />
      <span className="status-dot__label">{label}</span>
      {formattedLastSeen && status !== 'connected' && (
        <span className="status-dot__time">{formattedLastSeen}</span>
      )}
    </span>
  );
}
