/**
 * flood.config.ts — Flood Node configuration.
 * FRD.md section 11.
 */

import type { NodeConfig } from './types';

export const floodConfig: NodeConfig = {
  type: 'FLOOD',
  label: 'Hydrological Station',
  description: 'River water level, flow velocity, and precipitation accumulation telemetry.',
  metrics: [
    {
      key: 'waterLevel',
      label: 'Stage Water Level',
      unit: 'm',
      freshnessToleranceSeconds: 30,
      minExpected: 0,
      maxExpected: 6.0,
      hasChart: true,
    },
    {
      key: 'flowRate',
      label: 'Discharge Velocity',
      unit: 'm³/s',
      freshnessToleranceSeconds: 30,
      minExpected: 0,
      maxExpected: 15.0,
      hasChart: true,
    },
    {
      key: 'rainfall',
      label: 'Rainfall Intensity',
      unit: 'mm/h',
      freshnessToleranceSeconds: 60,
      minExpected: 0,
      maxExpected: 100,
      hasChart: true,
    },
  ],
  charts: [
    {
      metricKey: 'waterLevel',
      windowSeconds: 180,
      yLabel: 'Water Level (m)',
      showThresholdMarkers: true,
    },
    {
      metricKey: 'flowRate',
      windowSeconds: 180,
      yLabel: 'Flow Rate (m³/s)',
      showThresholdMarkers: false,
    },
    {
      metricKey: 'rainfall',
      windowSeconds: 180,
      yLabel: 'Precipitation (mm/h)',
      showThresholdMarkers: true,
    },
  ],
  mapLayers: [
    {
      id: 'inundation-contour',
      label: '100-Year Flood Contour',
      type: 'contour',
      defaultEnabled: true,
    },
    {
      id: 'submerged-roads',
      label: 'Impassable Road Segments',
      type: 'perimeter',
      defaultEnabled: true,
    },
  ],
  alertThresholds: [
    {
      metricKey: 'waterLevel',
      warningAbove: 2.8,
      criticalAbove: 4.2,
    },
    {
      metricKey: 'rainfall',
      warningAbove: 35.0,
      criticalAbove: 65.0,
    },
  ],
  derivedMetrics: [
    {
      key: 'peakCrestEstimate',
      label: 'Predicted Peak Crest Time',
      unit: 'hours',
      sourceLabel: 'Edge Model — Upstream Catchment Model v2.1',
    },
    {
      key: 'inundationRisk',
      label: 'Overtopping Risk Index',
      unit: '%',
      sourceLabel: 'Edge Model — Hydraulic Level Predictor',
    },
  ],
  actions: [
    {
      id: 'activate-flood-barrier',
      label: 'Deploy Inflatable Barriers',
      roles: ['AUTHORITY', 'ADMIN'],
      variant: 'primary',
    },
    {
      id: 'broadcast-flash-flood',
      label: 'Broadcast Flash Flood Warning',
      roles: ['AUTHORITY', 'ADMIN'],
      variant: 'danger',
    },
    {
      id: 'verify-culvert',
      label: 'Dispatch Culvert Clearance Team',
      roles: ['WORKER', 'AUTHORITY', 'ADMIN'],
      variant: 'secondary',
    },
  ],
};
