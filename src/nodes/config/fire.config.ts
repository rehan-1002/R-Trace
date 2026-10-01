/**
 * fire.config.ts — Fire Node configuration.
 * Primary SIH demonstrator.
 * PRD.md section 10, FRD.md section 10, DESIGN.md section 10.
 */

import type { NodeConfig } from './types';

export const fireConfig: NodeConfig = {
  type: 'FIRE',
  label: 'Wildfire Sentinel',
  description: 'Multi-spectral thermal, combustion gas, and infrared flame monitoring array.',
  metrics: [
    {
      key: 'temperature',
      label: 'Ambient Temperature',
      unit: '°C',
      freshnessToleranceSeconds: 30,
      minExpected: 0,
      maxExpected: 80,
      hasChart: true,
    },
    {
      key: 'smoke',
      label: 'Smoke / Gas Density',
      unit: 'ppm',
      freshnessToleranceSeconds: 30,
      minExpected: 0,
      maxExpected: 600,
      hasChart: true,
    },
    {
      key: 'humidity',
      label: 'Relative Humidity',
      unit: '% RH',
      freshnessToleranceSeconds: 60,
      minExpected: 10,
      maxExpected: 100,
      hasChart: true,
    },
    {
      key: 'flame',
      label: 'Flame IR Intensity',
      unit: 'IR idx',
      freshnessToleranceSeconds: 15,
      minExpected: 0,
      maxExpected: 1024,
      hasChart: false,
    },
  ],
  charts: [
    {
      metricKey: 'temperature',
      windowSeconds: 120,
      yLabel: 'Temperature (°C)',
      showThresholdMarkers: true,
    },
    {
      metricKey: 'smoke',
      windowSeconds: 120,
      yLabel: 'Smoke Density (ppm)',
      showThresholdMarkers: true,
    },
    {
      metricKey: 'humidity',
      windowSeconds: 120,
      yLabel: 'Humidity (% RH)',
      showThresholdMarkers: false,
    },
  ],
  mapLayers: [
    {
      id: 'fire-perimeter',
      label: 'Active Fire Perimeter',
      type: 'perimeter',
      defaultEnabled: true,
    },
    {
      id: 'thermal-heatmap',
      label: 'Thermal Intensity Heatmap',
      type: 'heatmap',
      defaultEnabled: true,
    },
    {
      id: 'evacuation-routes',
      label: 'Emergency Escape Corridors',
      type: 'evacuation',
      defaultEnabled: false,
    },
  ],
  alertThresholds: [
    {
      metricKey: 'temperature',
      warningAbove: 48.0,
      criticalAbove: 62.0,
    },
    {
      metricKey: 'smoke',
      warningAbove: 220.0,
      criticalAbove: 420.0,
    },
  ],
  derivedMetrics: [
    {
      key: 'spreadRisk',
      label: 'Fire Spread Velocity Risk',
      unit: '%',
      sourceLabel: 'Edge Model — Fire Spread Estimator v1.4',
    },
    {
      key: 'containmentProbability',
      label: 'Natural Containment Index',
      unit: 'score',
      sourceLabel: 'Edge Model — Topographic Wind Model',
    },
  ],
  actions: [
    {
      id: 'dispatch-fire-unit',
      label: 'Dispatch Suppression Unit',
      roles: ['AUTHORITY', 'ADMIN'],
      variant: 'danger',
    },
    {
      id: 'declare-evacuation',
      label: 'Issue Zone Evacuation Order',
      roles: ['AUTHORITY', 'ADMIN'],
      variant: 'primary',
    },
    {
      id: 'request-drone-verification',
      label: 'Request Aerial Drone Pass',
      roles: ['WORKER', 'AUTHORITY', 'ADMIN'],
      variant: 'secondary',
    },
  ],
};
