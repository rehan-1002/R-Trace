/**
 * event.ts — WebSocket event types.
 * All events received from the edge/backend via WebSocket are typed here.
 * These contracts match the data contract defined in the Master Implementation Plan section 9.
 */

import type { NodeType } from './node';

/** Discriminated union of all WebSocket event types */
export type WsEvent =
  | SensorReadingEvent
  | NodeStatusEvent
  | AlertEvent
  | AnalysisEvent
  | SyncRequestEvent
  | CameraEvent;

/**
 * A single sensor measurement.
 * Matches the normalized event contract from FRD.md section 5.2.
 */
export interface SensorReadingEvent {
  type: 'SENSOR_READING';
  nodeId: string;
  nodeType: NodeType;
  metric: string;
  value: number;
  unit: string;
  timestamp: string;  // ISO 8601 UTC
  /** 'hardware' if timestamp came from device, 'edge' if assigned at edge arrival */
  timestampSource?: 'hardware' | 'edge';
}

/** Node online/offline state change */
export interface NodeStatusEvent {
  type: 'NODE_STATUS';
  nodeId: string;
  status: 'online' | 'offline' | 'degraded';
  lastSeen?: string;
  batteryVoltage?: number;  // [ASSUMPTION — unconfirmed from hardware]
  rssi?: number;            // [ASSUMPTION — unconfirmed from hardware]
  timestamp: string;
}

/** Alert delivered to clients (role-filtered server-side) */
export interface AlertEvent {
  type: 'ALERT';
  alertId: string;
  incidentId?: string;
  nodeId: string;
  hazardType: NodeType;
  severity: AlertSeverity;
  source: AlertSource;
  confidence?: number;
  location?: { lat: number; lng: number };
  timestamp: string;
  status: string;
  message: string;
  publicApproved: boolean;
}

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type AlertSource = 'SENSOR' | 'MODEL' | 'WORKER_REPORT' | 'AUTHORITY';

/** Model/analysis output from the edge processor */
export interface AnalysisEvent {
  type: 'ANALYSIS';
  nodeId: string;
  modelId: string;
  metric: string;
  value: number;
  unit: string;
  timestamp: string;
  /** Always false — model output is never an official decision */
  isOfficial: false;
}

/** PWA requests missed events after reconnect */
export interface SyncRequestEvent {
  type: 'SYNC_REQUEST';
  nodeIds: string[];
  since: string;  // ISO 8601 UTC
}

/**
 * Camera/image evidence event from ESP32-CAM.
 * [ASSUMPTION — unconfirmed]: event-triggered JPEG capture, not continuous stream.
 */
export interface CameraEvent {
  type: 'CAMERA_EVENT';
  nodeId: string;
  imageUrl: string;
  detectionType: string;
  confidence?: number;
  timestamp: string;
}
