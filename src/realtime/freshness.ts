/**
 * freshness.ts — Telemetry freshness state classifier.
 * Evaluates observation age against per-metric configured tolerance.
 * RULES.md section 7: Stale data must display its timestamp; never display stale as live.
 * Master Implementation Plan section 6 (Phase 7).
 */

import type { MetricFreshness } from '@/types';

/**
 * Classifies telemetry age into 4 deterministic states:
 * - live: age < toleranceSeconds
 * - delayed: age < toleranceSeconds * 3
 * - stale: age < toleranceSeconds * 10
 * - unknown: older or invalid timestamp
 */
export function classifyFreshness(
  timestamp: string | null | undefined,
  toleranceSeconds: number
): MetricFreshness {
  if (!timestamp) return 'unknown';

  const timeMs = new Date(timestamp).getTime();
  if (isNaN(timeMs)) return 'unknown';

  const ageSeconds = (Date.now() - timeMs) / 1000;
  if (ageSeconds < 0) return 'live'; // Future timestamp tolerance for clock skew
  if (ageSeconds < toleranceSeconds) return 'live';
  if (ageSeconds < toleranceSeconds * 3) return 'delayed';
  if (ageSeconds < toleranceSeconds * 10) return 'stale';

  return 'unknown';
}
