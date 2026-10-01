/**
 * aqi.config.ts — Air Quality Index (AQI) Node configuration.
 * FRD.md section 12.
 */

import type { NodeConfig } from './types';

export const aqiConfig: NodeConfig = {
  type: 'AQI',
  label: 'Atmospheric Air Monitor',
  description: 'Optical particulate matter (PM2.5, PM10) and ambient air quality index tracking.',
  metrics: [
    {
      key: 'pm25',
      label: 'PM2.5 Fine Particulates',
      unit: 'µg/m³',
      freshnessToleranceSeconds: 45,
      minExpected: 0,
      maxExpected: 500,
      hasChart: true,
    },
    {
      key: 'pm10',
      label: 'PM10 Inhalable Particles',
      unit: 'µg/m³',
      freshnessToleranceSeconds: 45,
      minExpected: 0,
      maxExpected: 600,
      hasChart: true,
    },
    {
      key: 'aqi',
      label: 'Normalized AQI Score',
      unit: 'AQI',
      freshnessToleranceSeconds: 45,
      minExpected: 0,
      maxExpected: 500,
      hasChart: true,
    },
  ],
  charts: [
    {
      metricKey: 'pm25',
      windowSeconds: 180,
      yLabel: 'PM2.5 (µg/m³)',
      showThresholdMarkers: true,
    },
    {
      metricKey: 'aqi',
      windowSeconds: 180,
      yLabel: 'AQI Index',
      showThresholdMarkers: true,
    },
  ],
  mapLayers: [
    {
      id: 'smog-plume',
      label: 'Particulate Dispersion Plume',
      type: 'plume',
      defaultEnabled: true,
    },
  ],
  alertThresholds: [
    {
      metricKey: 'pm25',
      warningAbove: 60.0,
      criticalAbove: 150.0,
    },
    {
      metricKey: 'aqi',
      warningAbove: 150.0,
      criticalAbove: 250.0,
    },
  ],
  derivedMetrics: [
    {
      key: 'respiratoryRisk',
      label: 'Vulnerable Population Exposure',
      unit: 'category',
      sourceLabel: 'Edge Model — Epidemiological Exposure Index',
    },
  ],
  actions: [
    {
      id: 'issue-health-advisory',
      label: 'Issue Public Health Advisory',
      roles: ['AUTHORITY', 'ADMIN'],
      variant: 'primary',
    },
    {
      id: 'school-outdoor-ban',
      label: 'Enforce Outdoor Activity Restriction',
      roles: ['AUTHORITY', 'ADMIN'],
      variant: 'secondary',
    },
  ],
};
