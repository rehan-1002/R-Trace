/**
 * landslide.config.ts — Landslide Node configuration.
 * FRD.md section 13.
 */

import type { NodeConfig } from './types';

export const landslideConfig: NodeConfig = {
  type: 'LANDSLIDE',
  label: 'Geotechnical Slope Sentinel',
  description: 'Inclinometer, soil saturation sensor, and ground vibration geophone telemetry.',
  metrics: [
    {
      key: 'soilMoisture',
      label: 'Volumetric Water Content',
      unit: '%',
      freshnessToleranceSeconds: 30,
      minExpected: 0,
      maxExpected: 100,
      hasChart: true,
    },
    {
      key: 'tiltAngle',
      label: 'Slope Inclinometer Tilt',
      unit: '°',
      freshnessToleranceSeconds: 20,
      minExpected: 0,
      maxExpected: 90,
      hasChart: true,
    },
    {
      key: 'vibration',
      label: 'Seismic / Ground Vibration',
      unit: 'g',
      freshnessToleranceSeconds: 15,
      minExpected: 0,
      maxExpected: 5.0,
      hasChart: true,
    },
  ],
  charts: [
    {
      metricKey: 'soilMoisture',
      windowSeconds: 120,
      yLabel: 'Moisture (%)',
      showThresholdMarkers: true,
    },
    {
      metricKey: 'tiltAngle',
      windowSeconds: 120,
      yLabel: 'Tilt Angle (°)',
      showThresholdMarkers: true,
    },
    {
      metricKey: 'vibration',
      windowSeconds: 120,
      yLabel: 'Acceleration (g)',
      showThresholdMarkers: true,
    },
  ],
  mapLayers: [
    {
      id: 'slope-stability-zone',
      label: 'High Slope Instability Zone',
      type: 'perimeter',
      defaultEnabled: true,
    },
    {
      id: 'debris-flow-path',
      label: 'Predicted Debris Runout Corridor',
      type: 'contour',
      defaultEnabled: true,
    },
  ],
  alertThresholds: [
    {
      metricKey: 'soilMoisture',
      warningAbove: 75.0,
      criticalAbove: 88.0,
    },
    {
      metricKey: 'tiltAngle',
      warningAbove: 18.0,
      criticalAbove: 28.0,
    },
    {
      metricKey: 'vibration',
      warningAbove: 0.6,
      criticalAbove: 1.4,
    },
  ],
  derivedMetrics: [
    {
      key: 'shearFailureProb',
      label: 'Slope Shear Failure Risk',
      unit: '%',
      sourceLabel: 'Edge Model — Geotechnical Limit Equilibrium v3.0',
    },
  ],
  actions: [
    {
      id: 'close-mountain-pass',
      label: 'Close Mountain Highway Pass',
      roles: ['AUTHORITY', 'ADMIN'],
      variant: 'danger',
    },
    {
      id: 'evacuate-slope-base',
      label: 'Evacuate Slope Footprint',
      roles: ['AUTHORITY', 'ADMIN'],
      variant: 'primary',
    },
    {
      id: 'inspect-retaining-wall',
      label: 'Inspect Anchor Retaining Wall',
      roles: ['WORKER', 'AUTHORITY', 'ADMIN'],
      variant: 'secondary',
    },
  ],
};
