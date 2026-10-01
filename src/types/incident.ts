/**
 * incident.ts — Incident domain types.
 * Defines the incident record structure and lifecycle states.
 * Lifecycle from FRD.md section 12.
 */

import type { NodeType } from './node';
import type { AlertSeverity, AlertSource } from './event';

export type IncidentStatus =
  | 'OBSERVED'
  | 'ANALYZING'
  | 'ALERTED'
  | 'ACKNOWLEDGED'
  | 'RESPONDING'
  | 'RESOLVED';

export interface EvidenceRef {
  id: string;
  type: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'REPORT';
  url: string;
  timestamp: string;
  sourceLabel: string;
}

export interface Incident {
  id: string;
  hazardType: NodeType;
  nodeId: string;
  location: { lat: number; lng: number; label?: string };
  createdAt: string;
  updatedAt: string;
  severity: AlertSeverity;
  status: IncidentStatus;
  evidence: EvidenceRef[];
  /** Which source types have contributed (sensor, model, report, authority) */
  sourceTypes: AlertSource[];
  assignedWorkerIds: string[];
  authorityStatus?: string;
  summary?: string;
}
