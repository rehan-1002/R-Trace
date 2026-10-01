/**
 * node.ts — Core node domain types.
 * Every node in R-TRACE has a type, identity, location, health state, and connectivity.
 */

export type NodeType = 'FIRE' | 'FLOOD' | 'AQI' | 'LANDSLIDE' | 'INDUSTRIAL';

export type NodeHealthState =
  | 'normal'
  | 'warning'
  | 'critical'
  | 'offline'
  | 'stale'
  | 'unknown';

export interface NodeLocation {
  lat: number;
  lng: number;
  label?: string;
}

export interface NodeDefinition {
  id: string;
  type: NodeType;
  label: string;
  location: NodeLocation;
  description?: string;
  /** Whether the node definition is active/registered */
  active: boolean;
}

export interface NodeStatus {
  nodeId: string;
  health: NodeHealthState;
  lastSeen: string | null;     // ISO 8601 UTC
  batteryVoltage?: number;     // [ASSUMPTION — unconfirmed from hardware]
  rssi?: number;               // [ASSUMPTION — unconfirmed from hardware]
  online: boolean;
}
