/**
 * mockStore.ts — Static mock data and history store.
 * Generates realistic initial telemetry history and node statuses.
 * RULES.md: Mock data is strictly partitioned and tagged.
 */

import type { NodeDefinition, NodeStatus, DataPoint } from '@/types';
import { MOCK_NODES } from './nodes.mock';

export function getMockNodes(): NodeDefinition[] {
  return [...MOCK_NODES];
}

export function getMockNode(id: string): NodeDefinition | undefined {
  return MOCK_NODES.find((n) => n.id === id);
}

export function getMockNodeStatus(nodeId: string): NodeStatus {
  return {
    nodeId,
    health: 'normal',
    lastSeen: new Date().toISOString(),
    batteryVoltage: 3.92,
    rssi: -68,
    online: true,
  };
}

/**
 * Generates realistic historical points for initial chart loading.
 * Values follow a smooth baseline with realistic physical bounds.
 */
export function generateMockHistory(
  nodeId: string,
  metric: string,
  pointsCount = 40,
  intervalSeconds = 2
): DataPoint[] {
  const points: DataPoint[] = [];
  const now = Date.now();
  let baseValue = 24.0;
  let jitter = 0.5;

  if (nodeId.startsWith('FN')) {
    if (metric === 'temperature') {
      baseValue = 38.5;
      jitter = 0.8;
    } else if (metric === 'smoke') {
      baseValue = 120.0;
      jitter = 8.0;
    } else if (metric === 'humidity') {
      baseValue = 28.0;
      jitter = 1.0;
    }
  } else if (nodeId.startsWith('FL')) {
    if (metric === 'waterLevel') {
      baseValue = 1.45;
      jitter = 0.05;
    } else if (metric === 'flowRate') {
      baseValue = 4.2;
      jitter = 0.3;
    }
  } else if (nodeId.startsWith('AQ')) {
    if (metric === 'pm25') {
      baseValue = 42.0;
      jitter = 3.0;
    } else if (metric === 'aqi') {
      baseValue = 88.0;
      jitter = 4.0;
    }
  }

  let currentValue = baseValue;

  for (let i = pointsCount - 1; i >= 0; i--) {
    const timestamp = now - i * intervalSeconds * 1000;
    currentValue += (Math.random() - 0.48) * jitter;
    // Keep within reasonable positive bounds
    currentValue = Math.max(0, Math.round(currentValue * 100) / 100);
    points.push({ timestamp, value: currentValue });
  }

  return points;
}
