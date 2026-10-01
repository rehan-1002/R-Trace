/**
 * industrial.config.ts — Industrial Gas / Hazard Node configuration.
 * FRD.md section 14.
 */

import type { NodeConfig } from './types';

export const industrialConfig: NodeConfig = {
  type: 'INDUSTRIAL',
  label: 'Industrial Perimeter Gas Monitor',
  description: 'Photoionization VOC detection, catalytic combustible gas, and chemical perimeter monitoring.',
  metrics: [
    {
      key: 'voc',
      label: 'Volatile Organic Compounds',
      unit: 'ppb',
      freshnessToleranceSeconds: 20,
      minExpected: 0,
      maxExpected: 1000,
      hasChart: true,
    },
    {
      key: 'combustibleGas',
      label: 'Combustible Gas Lower Explosive Limit',
      unit: '% LEL',
      freshnessToleranceSeconds: 15,
      minExpected: 0,
      maxExpected: 100,
      hasChart: true,
    },
    {
      key: 'ambientTemp',
      label: 'Perimeter Temperature',
      unit: '°C',
      freshnessToleranceSeconds: 60,
      minExpected: 0,
      maxExpected: 70,
      hasChart: false,
    },
  ],
  charts: [
    {
      metricKey: 'voc',
      windowSeconds: 120,
      yLabel: 'VOC Concentration (ppb)',
      showThresholdMarkers: true,
    },
    {
      metricKey: 'combustibleGas',
      windowSeconds: 120,
      yLabel: 'Combustible Gas (% LEL)',
      showThresholdMarkers: true,
    },
  ],
  mapLayers: [
    {
      id: 'downwind-toxic-plume',
      label: 'Downwind Chemical Dispersion Plume',
      type: 'plume',
      defaultEnabled: true,
    },
    {
      id: 'blast-radius',
      label: 'VCE Blast Isolation Perimeter',
      type: 'perimeter',
      defaultEnabled: true,
    },
  ],
  alertThresholds: [
    {
      metricKey: 'voc',
      warningAbove: 180.0,
      criticalAbove: 400.0,
    },
    {
      metricKey: 'combustibleGas',
      warningAbove: 20.0,
      criticalAbove: 40.0,
    },
  ],
  derivedMetrics: [
    {
      key: 'explosionProbability',
      label: 'Explosive Atmosphere Risk',
      unit: '%',
      sourceLabel: 'Edge Model — BLEVE / VCE Vapor Dispersion Engine',
    },
  ],
  actions: [
    {
      id: 'seal-plant-gate',
      label: 'Activate Perimeter Gate Isolation',
      roles: ['AUTHORITY', 'ADMIN'],
      variant: 'danger',
    },
    {
      id: 'deploy-foam-deluge',
      label: 'Engage Automated Vapor Deluge',
      roles: ['AUTHORITY', 'ADMIN'],
      variant: 'primary',
    },
    {
      id: 'hazmat-recon',
      label: 'Deploy HAZMAT Survey Drone',
      roles: ['WORKER', 'AUTHORITY', 'ADMIN'],
      variant: 'secondary',
    },
  ],
};
