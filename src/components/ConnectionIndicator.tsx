/**
 * ConnectionIndicator.tsx — Edge and cloud connectivity indicator widget.
 * Explicitly tracks dual connectivity paths: edge and cloud.
 * PRD.md section 9, RULES.md section 11.
 */

import { useConnectionState } from '@/hooks/useConnectionState';
import type { ConnectivityStatus } from '@/types';

export function ConnectionIndicator() {
  const { edgeStatus, cloudStatus, reconnecting } = useConnectionState();

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        fontSize: 'var(--font-size-xs)',
      }}
    >
      <StatusItem label="Edge" status={edgeStatus} />
      <StatusItem label="Cloud" status={cloudStatus} />
      {reconnecting && (
        <span style={{ color: 'var(--color-state-warning)', fontSize: '10px' }}>
          (Reconnecting…)
        </span>
      )}
    </div>
  );
}

function StatusItem({
  label,
  status,
}: {
  label: string;
  status: ConnectivityStatus;
}) {
  const color =
    status === 'connected'
      ? 'var(--color-state-normal)'
      : status === 'disconnected'
        ? 'var(--color-state-offline)'
        : 'var(--color-state-unknown)';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        color: 'var(--color-text-secondary)',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: color,
        }}
        aria-hidden="true"
      />
      <span>{label}</span>
    </span>
  );
}
