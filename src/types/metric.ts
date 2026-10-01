/**
 * metric.ts — Sensor metric types.
 * Defines how individual metric readings are represented and their freshness.
 */

/** How fresh a metric reading is, determined from (now - timestamp) vs tolerance. */
export type MetricFreshness = 'live' | 'delayed' | 'stale' | 'unknown';

/**
 * A single live metric value as displayed in the UI.
 * Matches the LiveMetric interface defined in FRD.md section 6.
 */
export interface LiveMetric {
  key: string;
  label: string;
  unit: string;
  value: number | null;
  timestamp: string | null;    // ISO 8601 UTC
  status: MetricFreshness;
}

/**
 * Configuration for a metric within a node type.
 * Drives how the metric is displayed and its freshness tolerance.
 */
export interface MetricConfig {
  key: string;
  label: string;
  unit: string;
  /** Seconds before a reading is considered 'delayed' */
  freshnessToleranceSeconds: number;
  /** Minimum expected value (for chart y-axis context) */
  minExpected?: number;
  /** Maximum expected value (for chart y-axis context) */
  maxExpected?: number;
  /** Whether to show a live chart for this metric */
  hasChart: boolean;
}

/**
 * Configuration for a live chart within a node type view.
 */
export interface ChartConfig {
  metricKey: string;
  /** Seconds of data to show in the rolling window */
  windowSeconds: number;
  /** Y-axis label */
  yLabel: string;
  /** Whether to mark threshold crossings on the chart */
  showThresholdMarkers: boolean;
}

/** A single time-series data point for chart rendering */
export interface DataPoint {
  timestamp: number;  // Unix ms
  value: number;
}

/** A threshold definition for alerting and chart annotation */
export interface ThresholdConfig {
  metricKey: string;
  warningAbove?: number;
  criticalAbove?: number;
  warningBelow?: number;
  criticalBelow?: number;
}

/** A derived/computed metric (model output, not raw sensor) */
export interface DerivedMetricConfig {
  key: string;
  label: string;
  unit: string;
  /** Explicit label to show that this is model-derived, not raw sensor data */
  sourceLabel: string;
}
