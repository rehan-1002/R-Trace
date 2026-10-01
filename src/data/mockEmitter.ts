/**
 * mockEmitter.ts — Timer-based mock sensor reading emitter.
 * Emits SensorReadingEvent matching the normalized contract from FRD.md section 5.2.
 * Used when VITE_DATA_MODE='mock'.
 * Simulates real sensor physics with bounded drift and occasional spikes.
 */

import type { SensorReadingEvent, NodeType } from '@/types';
import { MOCK_NODES } from './nodes.mock';

type SensorCallback = (event: SensorReadingEvent) => void;

interface NodeMetricState {
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
}

// Running physical state per node and metric
const runningState: Record<string, Record<string, NodeMetricState>> = {
  'FN-001': {
    temperature: { value: 39.2, unit: '°C', min: 20, max: 85, step: 0.4 },
    smoke: { value: 145.0, unit: 'ppm', min: 20, max: 600, step: 4.0 },
    humidity: { value: 26.5, unit: '% RH', min: 10, max: 90, step: 0.3 },
  },
  'FL-001': {
    waterLevel: { value: 1.52, unit: 'm', min: 0.2, max: 4.5, step: 0.03 },
    flowRate: { value: 4.4, unit: 'm³/s', min: 0.5, max: 12.0, step: 0.1 },
    rainfall: { value: 12.0, unit: 'mm/h', min: 0, max: 80, step: 0.5 },
  },
  'AQ-001': {
    pm25: { value: 45.0, unit: 'µg/m³', min: 5, max: 300, step: 2.0 },
    pm10: { value: 68.0, unit: 'µg/m³', min: 10, max: 400, step: 3.0 },
    aqi: { value: 92.0, unit: 'AQI', min: 15, max: 350, step: 2.0 },
  },
  'LS-001': {
    soilMoisture: { value: 62.0, unit: '%', min: 10, max: 95, step: 0.5 },
    tiltAngle: { value: 14.2, unit: '°', min: 0, max: 45, step: 0.05 },
    vibration: { value: 0.12, unit: 'g', min: 0, max: 2.5, step: 0.02 },
  },
  'IN-001': {
    voc: { value: 85.0, unit: 'ppb', min: 10, max: 800, step: 3.0 },
    combustibleGas: { value: 18.0, unit: '% LEL', min: 0, max: 100, step: 0.8 },
    ambientTemp: { value: 31.0, unit: '°C', min: 15, max: 55, step: 0.2 },
  },
};

class MockEventEmitter {
  private subscribers: Map<string, Set<SensorCallback>> = new Map();
  private intervalId: number | null = null;
  private intervalMs = 2000;

  public subscribe(nodeId: string, callback: SensorCallback): () => void {
    if (!this.subscribers.has(nodeId)) {
      this.subscribers.set(nodeId, new Set());
    }
    this.subscribers.get(nodeId)!.add(callback);

    this.ensureRunning();

    return () => {
      const subs = this.subscribers.get(nodeId);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          this.subscribers.delete(nodeId);
        }
      }
      if (this.subscribers.size === 0) {
        this.stop();
      }
    };
  }

  private ensureRunning() {
    if (this.intervalId === null && typeof window !== 'undefined') {
      this.intervalId = window.setInterval(() => this.tick(), this.intervalMs);
    }
  }

  private stop() {
    if (this.intervalId !== null && typeof window !== 'undefined') {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private tick() {
    const timestamp = new Date().toISOString();

    for (const [nodeId, callbacks] of this.subscribers.entries()) {
      if (callbacks.size === 0) continue;

      const nodeDef = MOCK_NODES.find((n) => n.id === nodeId);
      const nodeType: NodeType = nodeDef?.type ?? 'FIRE';
      const nodeMetrics = runningState[nodeId];

      if (!nodeMetrics) continue;

      for (const [metricKey, metricState] of Object.entries(nodeMetrics)) {
        // Random walk with drift toward center
        const drift = (Math.random() - 0.49) * metricState.step;
        metricState.value = Math.min(
          metricState.max,
          Math.max(metricState.min, metricState.value + drift)
        );
        const roundedValue = Math.round(metricState.value * 100) / 100;

        const event: SensorReadingEvent = {
          type: 'SENSOR_READING',
          nodeId,
          nodeType,
          metric: metricKey,
          value: roundedValue,
          unit: metricState.unit,
          timestamp,
          timestampSource: 'edge',
        };

        callbacks.forEach((cb) => {
          try {
            cb(event);
          } catch (err) {
            console.error('Error in mock sensor callback', err);
          }
        });
      }
    }
  }
}

export const mockEmitter = new MockEventEmitter();
