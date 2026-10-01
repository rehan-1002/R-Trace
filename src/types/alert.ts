/**
 * alert.ts — Alert domain types.
 * Alerts are push-delivered events. See FRD.md section 13.
 */

import type { NodeType } from './node';
import type { AlertSeverity, AlertSource } from './event';

export type AlertLifecycleStatus =
  | 'ACTIVE'
  | 'ACKNOWLEDGED'
  | 'RESOLVED';

export interface Alert {
  id: string;
  incidentId?: string;
  nodeId: string;
  hazardType: NodeType;
  severity: AlertSeverity;
  source: AlertSource;
  confidence?: number;
  location?: { lat: number; lng: number };
  timestamp: string;
  lifecycleStatus: AlertLifecycleStatus;
  message: string;
  /** Whether this alert is approved for public display */
  publicApproved: boolean;
  /** Action or instruction associated with this alert */
  action?: string;
}
