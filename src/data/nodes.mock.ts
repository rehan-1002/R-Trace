/**
 * nodes.mock.ts — Mock node definitions.
 * Provides realistic node registry data for Mumbai, India environmental deployment.
 * All 5 hazard types represented: FIRE, FLOOD, AQI, LANDSLIDE, INDUSTRIAL.
 * Each hazard type features 4 strategic Indian Mumbai locations.
 * Primary demonstrator: Sanjay Gandhi National Park Fire Node (FN-001).
 */

import type { NodeDefinition } from '@/types';

export const MOCK_NODES: NodeDefinition[] = [
  // ---------------------------------------------------------------------------
  // FIRE NODES (Mumbai, India)
  // ---------------------------------------------------------------------------
  {
    id: 'FN-001',
    type: 'FIRE',
    label: 'Sanjay Gandhi National Park (SGNP)',
    location: {
      lat: 19.2288,
      lng: 72.9182,
      label: 'SGNP Borivali East Canopy',
    },
    description: 'Primary wildfire perimeter monitoring node with infrared flame detection, thermocouple array, and combustion gas telemetry.',
    active: true,
  },
  {
    id: 'FN-002',
    type: 'FIRE',
    label: 'Aarey Forest Green Buffer',
    location: {
      lat: 19.1485,
      lng: 72.8835,
      label: 'Aarey Colony Goregaon East',
    },
    description: 'Ecological forest buffer zone fire sentinel tracking dry vegetation temperature anomalies and ambient smoke density.',
    active: true,
  },
  {
    id: 'FN-003',
    type: 'FIRE',
    label: 'Deonar Bio-Waste Perimeter',
    location: {
      lat: 19.0558,
      lng: 72.9234,
      label: 'Chembur East Sector 3',
    },
    description: 'Spontaneous combustion and methane flare early-warning node with surface thermal tracking and optical smoke detection.',
    active: true,
  },
  {
    id: 'FN-004',
    type: 'FIRE',
    label: 'Dharavi Industrial Complex',
    location: {
      lat: 19.0434,
      lng: 72.8567,
      label: 'Sion-Dharavi Transit Core',
    },
    description: 'High-density urban settlement fire alert node with optical smoke obscuration, temperature rise, and CO sensors.',
    active: true,
  },

  // ---------------------------------------------------------------------------
  // FLOOD NODES (Mumbai, India)
  // ---------------------------------------------------------------------------
  {
    id: 'FL-001',
    type: 'FLOOD',
    label: 'Mithi River Outfall - BKC',
    location: {
      lat: 19.0657,
      lng: 72.8687,
      label: 'Bandra-Kurla Complex Bridge',
    },
    description: 'Ultrasonic river depth gauge, tidal surge monitor, and hydraulic flow rate sensor at the critical Mithi bottleneck.',
    active: true,
  },
  {
    id: 'FL-002',
    type: 'FLOOD',
    label: 'Hindmata Lowland Basin',
    location: {
      lat: 19.0178,
      lng: 72.8478,
      label: 'Dadar East Lowland Sump',
    },
    description: 'Severe waterlogging transit junction gauge monitoring street water level, drainage surcharge, and pump status.',
    active: true,
  },
  {
    id: 'FL-003',
    type: 'FLOOD',
    label: 'Milan Subway Underpass',
    location: {
      lat: 19.0886,
      lng: 72.8427,
      label: 'Santacruz West Subway',
    },
    description: 'Critical vehicular underpass flood sensor with submerged hydrostatic pressure sensor and flashing danger alert triggers.',
    active: true,
  },
  {
    id: 'FL-004',
    type: 'FLOOD',
    label: 'Poisar River Outfall',
    location: {
      lat: 19.2064,
      lng: 72.8470,
      label: 'Kandivali West Stormwater Canal',
    },
    description: 'Suburban stormwater canal level gauge tracking monsoon precipitation volume and high-tide reflux risks.',
    active: true,
  },

  // ---------------------------------------------------------------------------
  // AQI NODES (Mumbai, India)
  // ---------------------------------------------------------------------------
  {
    id: 'AQ-001',
    type: 'AQI',
    label: 'BKC Financial Commercial Core',
    location: {
      lat: 19.0607,
      lng: 72.8644,
      label: 'Bandra East Central Avenue',
    },
    description: 'Laser particle counter for PM2.5/PM10, vehicular emissions analyzer, and real-time US-EPA AQI calculation station.',
    active: true,
  },
  {
    id: 'AQ-002',
    type: 'AQI',
    label: 'Lower Parel Transit Corridor',
    location: {
      lat: 18.9926,
      lng: 72.8258,
      label: 'Senapati Bapat Marg Junction',
    },
    description: 'Urban street canyon air monitoring array recording high-density traffic exhaust, fine dust, and ambient humidity.',
    active: true,
  },
  {
    id: 'AQ-003',
    type: 'AQI',
    label: 'Chembur-Mahul Industrial Belt',
    location: {
      lat: 19.0062,
      lng: 72.8986,
      label: 'Mahul Road Refinery Buffer',
    },
    description: 'Heavy industrial buffer air quality monitor measuring hazardous particulates, sulfur compounds, and ground-level ozone.',
    active: true,
  },
  {
    id: 'AQ-004',
    type: 'AQI',
    label: 'Colaba Gateway Marine Promenade',
    location: {
      lat: 18.9220,
      lng: 72.8347,
      label: 'South Mumbai Promenade',
    },
    description: 'Coastal air quality baseline station measuring marine sea-spray aerosols, urban background PM2.5, and ambient air temp.',
    active: true,
  },

  // ---------------------------------------------------------------------------
  // LANDSLIDE NODES (Mumbai, India)
  // ---------------------------------------------------------------------------
  {
    id: 'LS-001',
    type: 'LANDSLIDE',
    label: 'Malabar Hill Coastal Cliff',
    location: {
      lat: 18.9548,
      lng: 72.7985,
      label: 'Walkeshwar Coastal Ridge',
    },
    description: 'High-angle rock cliff inclinometer with subsurface soil moisture probe and acoustic shear displacement detection.',
    active: true,
  },
  {
    id: 'LS-002',
    type: 'LANDSLIDE',
    label: 'Ghatkopar Hillside Slope',
    location: {
      lat: 19.0988,
      lng: 72.9067,
      label: 'Asalpha-Bhatwadi Incline',
    },
    description: 'Settlement slope stability sensor with multi-axis tiltmeters, rainfall infiltration rate, and micro-vibration geophones.',
    active: true,
  },
  {
    id: 'LS-003',
    type: 'LANDSLIDE',
    label: 'Kandivali Quarry Escarpment',
    location: {
      lat: 19.2014,
      lng: 72.8711,
      label: 'Akurli Road Ridge Face',
    },
    description: 'Quarry perimeter geophone array monitoring bedrock displacement, slope shear stress, and blast-induced vibrations.',
    active: true,
  },
  {
    id: 'LS-004',
    type: 'LANDSLIDE',
    label: 'Trombay Hill Ridge Sentinel',
    location: {
      lat: 19.0163,
      lng: 72.9157,
      label: 'BARC Perimeter High Incline',
    },
    description: 'Critical facility ridge stability node featuring dual-axis MEMS tiltmeters and deep soil saturation telemetry.',
    active: true,
  },

  // ---------------------------------------------------------------------------
  // INDUSTRIAL NODES (Mumbai, India)
  // ---------------------------------------------------------------------------
  {
    id: 'IN-001',
    type: 'INDUSTRIAL',
    label: 'Mahul Refinery Terminal Gate 4',
    location: {
      lat: 19.0095,
      lng: 72.8950,
      label: 'Trombay Petroleum Corridor',
    },
    description: 'Petrochemical terminal volatile organic compound (VOC) photoionization detector, combustible gas, and thermal array.',
    active: true,
  },
  {
    id: 'IN-002',
    type: 'INDUSTRIAL',
    label: 'TTC Industrial Zone - Pawane',
    location: {
      lat: 19.0880,
      lng: 73.0180,
      label: 'Navi Mumbai Chemical Belt',
    },
    description: 'Chemical manufacturing zone fence-line monitor measuring toxic vapor release, explosive gas LEL, and wind speed.',
    active: true,
  },
  {
    id: 'IN-003',
    type: 'INDUSTRIAL',
    label: 'Sewri BPT Wharf & Bunkering',
    location: {
      lat: 18.9980,
      lng: 72.8590,
      label: 'Mumbai Port Trust Wharf',
    },
    description: 'Marine fuel bunkering and dockside hazardous gas monitor with flammable vapor detection and ambient air monitoring.',
    active: true,
  },
  {
    id: 'IN-004',
    type: 'INDUSTRIAL',
    label: 'Kurla Scrap & Metal Yard',
    location: {
      lat: 19.0650,
      lng: 72.8790,
      label: 'LBS Marg Industrial Cluster',
    },
    description: 'Battery recycling and metal reprocessing fumes monitor with acid vapor detection and ambient thermal tracking.',
    active: true,
  },
];
