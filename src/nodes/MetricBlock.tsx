/**
 * MetricBlock.tsx — Core single measurement primitive.
 * Displays: label, numeric value with tabular numerals, unit, freshness status, and timestamp.
 * DESIGN.md section 15 (Metric Block).
 * RULES.md section 7: Stale data must display its timestamp; never display stale as live.
 */

import type { MetricFreshness } from '@/types';
import './MetricBlock.css';

interface MetricBlockProps {
  label: string;
  value: number | null;
  unit: string;
  freshness?: MetricFreshness;
  timestamp?: string | null;
  warningAbove?: number;
  criticalAbove?: number;
}

export function MetricBlock({
  label,
  value,
  unit,
  freshness = 'unknown',
  timestamp,
  warningAbove,
  criticalAbove,
}: MetricBlockProps) {
  // Determine severity border
  let severityClass = '';
  if (value !== null) {
    if (criticalAbove !== undefined && value >= criticalAbove) {
      severityClass = 'metric-block--critical';
    } else if (warningAbove !== undefined && value >= warningAbove) {
      severityClass = 'metric-block--warning';
    }
  }

  const formattedValue = value !== null ? value.toFixed(1) : '—';
  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : 'Waiting…';

  return (
    <div className={`metric-block ${severityClass}`}>
      <div className="metric-block__header">
        <span className="metric-block__label">{label}</span>
        <span
          className={`metric-block__freshness metric-block__freshness--${freshness}`}
          title={`Data Freshness: ${freshness}`}
        >
          <span className="metric-block__freshness-dot" aria-hidden="true" />
          <span>{freshness}</span>
        </span>
      </div>

      <div className="metric-block__value-row">
        <span className="metric-block__value">{formattedValue}</span>
        <span className="metric-block__unit">{unit}</span>
      </div>

      <div className="metric-block__footer">
        <span>Observed:</span>
        <time className="metric-block__timestamp" dateTime={timestamp ?? undefined}>
          {formattedTime}
        </time>
      </div>
    </div>
  );
}
