/**
 * MetricBuffer.ts — FIFO bounded buffer for streaming time-series data.
 * Ensures strict memory bounds: prunes points exceeding the retention window.
 * RULES.md section 8: Bounded client-side buffers for live charts.
 * Master Implementation Plan section 6 (Phase 7).
 */

import type { DataPoint } from '@/types';

export class MetricBuffer {
  private points: DataPoint[] = [];
  private readonly maxCapacity: number;
  private readonly maxRetentionSeconds: number;

  constructor(maxCapacity = 300, maxRetentionSeconds = 600) {
    this.maxCapacity = maxCapacity;
    this.maxRetentionSeconds = maxRetentionSeconds;
  }

  public push(point: DataPoint): void {
    this.points.push(point);

    // Enforce max count
    if (this.points.length > this.maxCapacity) {
      this.points.shift();
    }

    // Enforce time retention window
    const cutoff = point.timestamp - this.maxRetentionSeconds * 1000;
    while (this.points.length > 0 && this.points[0].timestamp < cutoff) {
      this.points.shift();
    }
  }

  public getWindow(seconds: number): DataPoint[] {
    if (this.points.length === 0) return [];
    const now = Date.now();
    const cutoff = now - seconds * 1000;

    // Binary search or filter points
    const startIdx = this.points.findIndex((p) => p.timestamp >= cutoff);
    if (startIdx === -1) {
      // If all points are older than cutoff, return last point if any
      return this.points.slice(-1);
    }
    return this.points.slice(startIdx);
  }

  public getAll(): DataPoint[] {
    return [...this.points];
  }

  public getLatest(): DataPoint | null {
    if (this.points.length === 0) return null;
    return this.points[this.points.length - 1];
  }

  public clear(): void {
    this.points = [];
  }

  public get length(): number {
    return this.points.length;
  }
}
