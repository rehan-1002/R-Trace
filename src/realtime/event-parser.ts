/**
 * event-parser.ts — Real-time event parser and runtime validator.
 * Validates incoming WebSocket frames into typed WsEvent domain contracts.
 * Master Implementation Plan section 6 (Phase 7).
 */

import type { WsEvent } from '@/types';

export function parseWsMessage(raw: unknown): WsEvent | null {
  try {
    let payload: unknown = raw;
    if (typeof raw === 'string') {
      payload = JSON.parse(raw);
    }

    if (!payload || typeof payload !== 'object') {
      return null;
    }

    const event = payload as Record<string, unknown>;
    const type = event.type;

    if (typeof type !== 'string') {
      return null;
    }

    switch (type) {
      case 'SENSOR_READING': {
        if (
          typeof event.nodeId === 'string' &&
          typeof event.nodeType === 'string' &&
          typeof event.metric === 'string' &&
          typeof event.value === 'number' &&
          typeof event.timestamp === 'string'
        ) {
          return event as unknown as WsEvent;
        }
        return null;
      }

      case 'NODE_STATUS': {
        if (
          typeof event.nodeId === 'string' &&
          typeof event.status === 'string' &&
          typeof event.timestamp === 'string'
        ) {
          return event as unknown as WsEvent;
        }
        return null;
      }

      case 'ALERT': {
        if (
          typeof event.alertId === 'string' &&
          typeof event.nodeId === 'string' &&
          typeof event.hazardType === 'string' &&
          typeof event.severity === 'string' &&
          typeof event.message === 'string'
        ) {
          return event as unknown as WsEvent;
        }
        return null;
      }

      case 'ANALYSIS': {
        if (
          typeof event.nodeId === 'string' &&
          typeof event.modelId === 'string' &&
          typeof event.metric === 'string' &&
          typeof event.value === 'number'
        ) {
          return event as unknown as WsEvent;
        }
        return null;
      }

      case 'CAMERA_EVENT': {
        if (
          typeof event.nodeId === 'string' &&
          typeof event.imageUrl === 'string' &&
          typeof event.timestamp === 'string'
        ) {
          return event as unknown as WsEvent;
        }
        return null;
      }

      default:
        return null;
    }
  } catch {
    return null;
  }
}
