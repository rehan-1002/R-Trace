/**
 * connection.ts — Connection state types.
 * Tracks both edge and cloud connectivity independently, as required by
 * PRD.md section 9 and RULES.md section 11.
 */

export type ConnectivityStatus = 'connected' | 'disconnected' | 'unknown';

export interface ConnectionState {
  /** Connection to the regional edge WebSocket server */
  edgeStatus: ConnectivityStatus;
  /** Connection to the cloud backend API */
  cloudStatus: ConnectivityStatus;
  /** Last time an edge event was received (ISO 8601 UTC) */
  lastEdgeSeen: string | null;
  /** Last time a cloud API call succeeded (ISO 8601 UTC) */
  lastCloudSeen: string | null;
  /** Whether a WebSocket reconnect is currently in progress */
  reconnecting: boolean;
}
