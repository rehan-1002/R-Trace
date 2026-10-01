/**
 * mockEmitter.ts — Timer-based mock sensor reading emitter.
 * Emits SensorReadingEvent matching the normalized contract from FRD.md section 5.2.
 * Used when VITE_DATA_MODE='mock'.
 * Simulates real sensor physics with bounded drift and occasional spikes across all Mumbai nodes.
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

function getInitialNodeMetrics(nodeType: NodeType): Record<string, NodeMetricState> {
  switch (nodeType) {
    case 'FIRE':
      return {
        temperature: { value: 36.5 + Math.random() * 4, unit: '°C', min: 20, max: 85, step: 0.4 },
        smoke: { value: 120.0 + Math.random() * 30, unit: 'ppm', min: 20, max: 600, step: 4.0 },
        humidity: { value: 28.0 + Math.random() * 6, unit: '% RH', min: 10, max: 90, step: 0.3 },
      };
    case 'FLOOD':
      return {
        waterLevel: { value: 1.45 + Math.random() * 0.3, unit: 'm', min: 0.2, max: 4.5, step: 0.03 },
        flowRate: { value: 4.2 + Math.random() * 0.8, unit: 'm³/s', min: 0.5, max: 12.0, step: 0.1 },
        rainfall: { value: 12.0 + Math.random() * 8, unit: 'mm/h', min: 0, max: 80, step: 0.5 },
      };
    case 'AQI':
      return {
        pm25: { value: 42.0 + Math.random() * 10, unit: 'µg/m³', min: 5, max: 300, step: 2.0 },
        pm10: { value: 68.0 + Math.random() * 15, unit: 'µg/m³', min: 10, max: 400, step: 3.0 },
        aqi: { value: 88.0 + Math.random() * 16, unit: 'AQI', min: 15, max: 350, step: 2.0 },
      };
    case 'LANDSLIDE':
      return {
        soilMoisture: { value: 60.0 + Math.random() * 8, unit: '%', min: 10, max: 95, step: 0.5 },
        tiltAngle: { value: 13.5 + Math.random() * 2, unit: '°', min: 0, max: 45, step: 0.05 },
        vibration: { value: 0.12 + Math.random() * 0.04, unit: 'g', min: 0, max: 2.5, step: 0.02 },
      };
    case 'INDUSTRIAL':
      return {
        voc: { value: 80.0 + Math.random() * 15, unit: 'ppb', min: 10, max: 800, step: 3.0 },
        combustibleGas: { value: 16.0 + Math.random() * 5, unit: '% LEL', min: 0, max: 100, step: 0.8 },
        ambientTemp: { value: 31.0 + Math.random() * 3, unit: '°C', min: 15, max: 55, step: 0.2 },
      };
  }
}

// Running physical state per node and metric
const runningState: Record<string, Record<string, NodeMetricState>> = {};

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

      if (!runningState[nodeId]) {
        runningState[nodeId] = getInitialNodeMetrics(nodeType);
      }
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
