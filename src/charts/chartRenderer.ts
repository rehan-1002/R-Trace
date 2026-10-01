/**
 * chartRenderer.ts — High-performance HTML5 Canvas chart renderer.
 * Pure canvas rendering engine: zero React re-renders per point (P6).
 * Supports high-DPI displays, threshold lines, and gradient area fills.
 * Master Implementation Plan section 6 (Phase 8).
 */

import type { DataPoint } from '@/types';

export interface ChartRenderOptions {
  yLabel?: string;
  unit?: string;
  strokeColor?: string;
  fillColor?: string;
  warningAbove?: number;
  criticalAbove?: number;
  minExpected?: number;
  maxExpected?: number;
}

export function renderStreamingChart(
  canvas: HTMLCanvasElement,
  points: DataPoint[],
  options: ChartRenderOptions = {}
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;

  if (width === 0 || height === 0) return;

  // Sync canvas internal resolution with physical display pixels
  if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
    canvas.width = width * dpr;
    canvas.height = height * dpr;
  }

  ctx.save();
  ctx.scale(dpr, dpr);

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  const paddingLeft = 40;
  const paddingRight = 16;
  const paddingTop = 16;
  const paddingBottom = 24;
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  if (plotWidth <= 0 || plotHeight <= 0) {
    ctx.restore();
    return;
  }

  // Calculate value bounds
  let minVal = options.minExpected ?? Infinity;
  let maxVal = options.maxExpected ?? -Infinity;

  if (points.length > 0) {
    for (const p of points) {
      if (p.value < minVal) minVal = p.value;
      if (p.value > maxVal) maxVal = p.value;
    }
  }

  if (!isFinite(minVal)) minVal = 0;
  if (!isFinite(maxVal)) maxVal = 100;
  if (minVal === maxVal) {
    minVal -= 1;
    maxVal += 1;
  }

  // Add 10% head/foot room
  const valRange = maxVal - minVal;
  const yMin = Math.max(0, minVal - valRange * 0.05);
  const yMax = maxVal + valRange * 0.1;
  const totalYRange = yMax - yMin || 1;

  // Grid lines (3 horizontal intervals)
  ctx.strokeStyle = 'hsl(215 12% 18%)';
  ctx.lineWidth = 1;
  ctx.fillStyle = 'hsl(210 6% 45%)';
  ctx.font = '10px Inter, system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';

  const gridSteps = 3;
  for (let i = 0; i <= gridSteps; i++) {
    const yVal = yMin + (totalYRange * i) / gridSteps;
    const yPx = paddingTop + plotHeight - (plotHeight * i) / gridSteps;

    ctx.beginPath();
    ctx.moveTo(paddingLeft, yPx);
    ctx.lineTo(paddingLeft + plotWidth, yPx);
    ctx.stroke();

    ctx.fillText(yVal.toFixed(1), paddingLeft - 6, yPx);
  }

  // Draw threshold lines if specified
  if (options.warningAbove !== undefined && options.warningAbove >= yMin && options.warningAbove <= yMax) {
    const warnY = paddingTop + plotHeight - ((options.warningAbove - yMin) / totalYRange) * plotHeight;
    ctx.strokeStyle = 'hsl(38 90% 52% / 0.5)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(paddingLeft, warnY);
    ctx.lineTo(paddingLeft + plotWidth, warnY);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  if (options.criticalAbove !== undefined && options.criticalAbove >= yMin && options.criticalAbove <= yMax) {
    const critY = paddingTop + plotHeight - ((options.criticalAbove - yMin) / totalYRange) * plotHeight;
    ctx.strokeStyle = 'hsl(4 78% 50% / 0.6)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(paddingLeft, critY);
    ctx.lineTo(paddingLeft + plotWidth, critY);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  if (points.length < 2) {
    ctx.restore();
    return;
  }

  // Compute (x, y) plot coordinates
  const timeMin = points[0].timestamp;
  const timeMax = points[points.length - 1].timestamp;
  const timeRange = timeMax - timeMin || 1;

  const coords = points.map((p) => {
    const x = paddingLeft + ((p.timestamp - timeMin) / timeRange) * plotWidth;
    const y = paddingTop + plotHeight - ((p.value - yMin) / totalYRange) * plotHeight;
    return { x, y };
  });

  const strokeColor = options.strokeColor ?? 'hsl(196 80% 48%)';

  // Area Fill
  const gradient = ctx.createLinearGradient(0, paddingTop, 0, paddingTop + plotHeight);
  gradient.addColorStop(0, options.fillColor ?? 'hsl(196 80% 48% / 0.2)');
  gradient.addColorStop(1, 'hsl(196 80% 48% / 0.0)');

  ctx.beginPath();
  ctx.moveTo(coords[0].x, coords[0].y);
  for (let i = 1; i < coords.length; i++) {
    ctx.lineTo(coords[i].x, coords[i].y);
  }
  ctx.lineTo(coords[coords.length - 1].x, paddingTop + plotHeight);
  ctx.lineTo(coords[0].x, paddingTop + plotHeight);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  // Line Stroke
  ctx.beginPath();
  ctx.moveTo(coords[0].x, coords[0].y);
  for (let i = 1; i < coords.length; i++) {
    ctx.lineTo(coords[i].x, coords[i].y);
  }
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Latest point circle
  const latestCoord = coords[coords.length - 1];
  ctx.beginPath();
  ctx.arc(latestCoord.x, latestCoord.y, 4, 0, Math.PI * 2);
  ctx.fillStyle = strokeColor;
  ctx.fill();
  ctx.strokeStyle = 'hsl(215 16% 9%)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.restore();
}
