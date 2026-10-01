/**
 * types.ts — Node configuration schema.
 * Defines the structural contract for adaptive node views.
 * Every node type config conforms to NodeConfig.
 * Master Implementation Plan section 6 (Phase 6).
 */

import type { NodeType, UserRole } from '@/types';
import type {
  MetricConfig,
  ChartConfig,
  ThresholdConfig,
  DerivedMetricConfig,
} from '@/types/metric';

export interface MapLayerConfig {
  id: string;
  label: string;
  type: 'heatmap' | 'contour' | 'perimeter' | 'plume' | 'evacuation';
  defaultEnabled: boolean;
}

export interface ActionConfig {
  id: string;
  label: string;
  description?: string;
  roles: UserRole[];
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface NodeConfig {
  type: NodeType;
  label: string;
  description: string;
  metrics: MetricConfig[];
  charts: ChartConfig[];
  mapLayers: MapLayerConfig[];
  alertThresholds: ThresholdConfig[];
  derivedMetrics: DerivedMetricConfig[];
  actions: ActionConfig[];
}
