/**
 * FreshnessIndicator.tsx — Granular freshness indicator.
 * Displays live / delayed / stale / unknown status.
 * RULES.md section 7: Stale data must display its timestamp; never display stale as live.
 */

import type { MetricFreshness } from '@/types';

interface FreshnessIndicatorProps {
  freshness: MetricFreshness;
  showLabel?: boolean;
}

const FRESHNESS_COLORS: Record<MetricFreshness, string> = {
  live: 'var(--color-state-normal)',
  delayed: 'var(--color-state-warning)',
  stale: 'var(--color-state-stale)',
  unknown: 'var(--color-state-unknown)',
};

export function FreshnessIndicator({
  freshness,
  showLabel = true,
}: FreshnessIndicatorProps) {
  const color = FRESHNESS_COLORS[freshness] ?? FRESHNESS_COLORS.unknown;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        color,
        fontSize: '10px',
        fontWeight: 'var(--font-weight-semibold)',
        textTransform: 'uppercase',
        letterSpacing: 'var(--letter-spacing-wide)',
      }}
      title={`Freshness: ${freshness}`}
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
      {showLabel && <span>{freshness}</span>}
    </span>
  );
}
