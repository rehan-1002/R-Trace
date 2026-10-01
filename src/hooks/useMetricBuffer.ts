/**
 * useMetricBuffer.ts — React hook for reading bounded rolling buffer data.
 * Subscribes to revision integer, returning stable points array without infinite loops.
 * Master Implementation Plan section 6 (Phase 7).
 */

import { useMemo } from 'react';
import { useLiveStore } from '@/stores/live';
import type { DataPoint } from '@/types';

const EMPTY_POINTS: DataPoint[] = [];

export function useMetricBuffer(
  nodeId: string,
  metricKey: string,
  windowSeconds = 120
): DataPoint[] {
  // Subscribe only to primitive revision integer — never creates new references on idle renders
  const revision = useLiveStore((state) => state.revisions[nodeId]?.[metricKey] ?? 0);

  return useMemo(() => {
    const buffer = useLiveStore.getState().buffers[nodeId]?.[metricKey];
    if (!buffer) return EMPTY_POINTS;
    return buffer.getWindow(windowSeconds);
  }, [nodeId, metricKey, windowSeconds, revision]);
}
