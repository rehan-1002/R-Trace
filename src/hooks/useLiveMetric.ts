/**
 * useLiveMetric.ts — React hook for observing a single live sensor metric.
 * P6 Rule: Re-renders only when this specific metric updates.
 * Master Implementation Plan section 6 (Phase 7).
 */

import { useLiveStore } from '@/stores/live';
import type { LiveMetric } from '@/types';

export function useLiveMetric(
  nodeId: string,
  metricKey: string
): LiveMetric | undefined {
  return useLiveStore((state) => state.metrics[nodeId]?.[metricKey]);
}
