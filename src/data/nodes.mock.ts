/**
 * nodes.mock.ts — Mock node definitions.
 * Provides realistic node registry data for development and demonstration.
 * All 5 hazard types represented: FIRE, FLOOD, AQI, LANDSLIDE, INDUSTRIAL.
 * Fire Node is the primary SIH demonstrator (PRD.md).
 */

import type { NodeDefinition } from '@/types';

export const MOCK_NODES: NodeDefinition[] = [
  {
    id: 'FN-001',
    type: 'FIRE',
    label: 'Pine Ridge Sector 4',
    location: {
      lat: 34.0522,
      lng: -118.2437,
      label: 'Sector 4 Ridge Crest',
    },
    description: 'Primary wildfire perimeter monitoring node with temperature, smoke, and flame detection.',
    active: true,
  },
  {
    id: 'FL-001',
    type: 'FLOOD',
    label: 'River Valley Gauge 2',
    location: {
      lat: 34.0622,
      lng: -118.2537,
      label: 'Lower River Basin',
    },
    description: 'Ultrasonic water level gauge and precipitation monitor.',
    active: true,
  },
  {
    id: 'AQ-001',
    type: 'AQI',
    label: 'Urban Metro Station B',
    location: {
      lat: 34.0422,
      lng: -118.2337,
      label: 'Downtown Transit Corridor',
    },
    description: 'Particulate matter (PM2.5, PM10) and ambient air quality station.',
    active: true,
  },
  {
    id: 'LS-001',
    type: 'LANDSLIDE',
    label: 'Ridge Slope Monitor 7',
    location: {
      lat: 34.0722,
      lng: -118.2637,
      label: 'North Face Incline',
    },
    description: 'Soil moisture, slope angle inclinometer, and vibration telemetry.',
    active: true,
  },
  {
    id: 'IN-001',
    type: 'INDUSTRIAL',
    label: 'Chemical Plant Perimeter East',
    location: {
      lat: 34.0322,
      lng: -118.2237,
      label: 'Industrial Zone Gate 3',
    },
    description: 'Volatile organic compound (VOC) and hazardous gas detection array.',
    active: true,
  },
];
