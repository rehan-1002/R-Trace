/**
 * NodeHealthBadge.tsx — Semantic health state indicator.
 * DESIGN.md section 9.
 * Strictly adheres to 6 semantic states: normal, warning, critical, offline, stale, unknown.
 * OFFLINE is NEVER displayed as green.
 */

import type { NodeHealthState } from '@/types';
import './NodeHealthBadge.css';

interface NodeHealthBadgeProps {
  health: NodeHealthState;
  showLabel?: boolean;
}

const HEALTH_LABELS: Record<NodeHealthState, string> = {
  normal: 'Normal',
  warning: 'Warning',
  critical: 'Critical',
  offline: 'Offline',
  stale: 'Stale',
  unknown: 'Unknown',
};

export function NodeHealthBadge({ health, showLabel = true }: NodeHealthBadgeProps) {
  const label = HEALTH_LABELS[health] ?? 'Unknown';

  return (
    <span
      className={`node-health-badge node-health-badge--${health}`}
      aria-label={`Status: ${label}`}
      role="status"
    >
      <span className="node-health-badge__dot" aria-hidden="true" />
      {showLabel && <span>{label}</span>}
    </span>
  );
}
