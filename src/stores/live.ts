/**
 * live.ts — Zustand store for live telemetry.
 * Sub-divided by nodeId and metricKey to prevent cascade re-renders (P6).
 * Maintains revision counters for rock-solid reactive subscriptions without infinite loops.
 * RULES.md section 8: Bounded client buffers; update only affected components.
 * Master Implementation Plan section 6 (Phase 7).
 */

import { create } from 'zustand';
import type { LiveMetric, SensorReadingEvent, DataPoint } from '@/types';
import { MetricBuffer } from '@/realtime/MetricBuffer';
import { classifyFreshness } from '@/realtime/freshness';

interface LiveState {
  metrics: Record<string, Record<string, LiveMetric>>;
  buffers: Record<string, Record<string, MetricBuffer>>;
  revisions: Record<string, Record<string, number>>;
  ingestReading: (event: SensorReadingEvent, toleranceSeconds?: number) => void;
  seedHistory: (nodeId: string, metricKey: string, points: DataPoint[]) => void;
  getMetric: (nodeId: string, metricKey: string) => LiveMetric | undefined;
  getBuffer: (nodeId: string, metricKey: string) => MetricBuffer | undefined;
  clearNode: (nodeId: string) => void;
}

export const useLiveStore = create<LiveState>((set, get) => ({
  metrics: {},
  buffers: {},
  revisions: {},

  ingestReading: (event, toleranceSeconds = 30) => {
    const { nodeId, metric, value, unit, timestamp } = event;
    const timeMs = new Date(timestamp).getTime();

    set((state) => {
      // 1. Update bounded MetricBuffer
      const nodeBuffers = state.buffers[nodeId] ?? {};
      let buffer = nodeBuffers[metric];
      if (!buffer) {
        buffer = new MetricBuffer(300, 600);
        nodeBuffers[metric] = buffer;
      }
      buffer.push({ timestamp: timeMs, value });

      // 2. Update latest LiveMetric
      const nodeMetrics = state.metrics[nodeId] ?? {};
      const freshness = classifyFreshness(timestamp, toleranceSeconds);

      nodeMetrics[metric] = {
        key: metric,
        label: metric,
        unit,
        value,
        timestamp,
        status: freshness,
      };

      // 3. Bump revision for fine-grained reactivity
      const nodeRevisions = { ...(state.revisions[nodeId] ?? {}) };
      nodeRevisions[metric] = (nodeRevisions[metric] ?? 0) + 1;

      return {
        metrics: { ...state.metrics, [nodeId]: { ...nodeMetrics } },
        buffers: { ...state.buffers, [nodeId]: { ...nodeBuffers } },
        revisions: { ...state.revisions, [nodeId]: nodeRevisions },
      };
    });
  },

  seedHistory: (nodeId, metricKey, points) => {
    set((state) => {
      const nodeBuffers = state.buffers[nodeId] ?? {};
      const buffer = nodeBuffers[metricKey] ?? new MetricBuffer(300, 600);

      points.forEach((p) => buffer.push(p));
      nodeBuffers[metricKey] = buffer;

      const nodeRevisions = { ...(state.revisions[nodeId] ?? {}) };
      nodeRevisions[metricKey] = (nodeRevisions[metricKey] ?? 0) + 1;

      return {
        buffers: { ...state.buffers, [nodeId]: { ...nodeBuffers } },
        revisions: { ...state.revisions, [nodeId]: nodeRevisions },
      };
    });
  },

  getMetric: (nodeId, metricKey) => {
    return get().metrics[nodeId]?.[metricKey];
  },

  getBuffer: (nodeId, metricKey) => {
    return get().buffers[nodeId]?.[metricKey];
  },

  clearNode: (nodeId) => {
    set((state) => {
      const newMetrics = { ...state.metrics };
      const newBuffers = { ...state.buffers };
      const newRevisions = { ...state.revisions };
      delete newMetrics[nodeId];
      delete newBuffers[nodeId];
      delete newRevisions[nodeId];
      return { metrics: newMetrics, buffers: newBuffers, revisions: newRevisions };
    });
  },
}));
