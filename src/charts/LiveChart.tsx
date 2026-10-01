/**
 * LiveChart.tsx — Real-time streaming canvas chart.
 * Subscribes to useMetricBuffer for fine-grained reactivity (P6).
 * Auto-seeds baseline history and auto-subscribes to telemetry stream.
 * Master Implementation Plan section 6 (Phase 8).
 */

import { useEffect, useRef } from 'react';
import { useMetricBuffer } from '@/hooks/useMetricBuffer';
import { useLiveStore } from '@/stores/live';
import { dataSource } from '@/data/dataSource';
import { renderStreamingChart } from './chartRenderer';
import './LiveChart.css';

interface LiveChartProps {
  nodeId: string;
  metricKey: string;
  title: string;
  unit: string;
  windowSeconds?: number;
  warningAbove?: number;
  criticalAbove?: number;
  minExpected?: number;
  maxExpected?: number;
  strokeColor?: string;
}

export function LiveChart({
  nodeId,
  metricKey,
  title,
  unit,
  windowSeconds = 120,
  warningAbove,
  criticalAbove,
  minExpected,
  maxExpected,
  strokeColor,
}: LiveChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const points = useMetricBuffer(nodeId, metricKey, windowSeconds);

  const latestVal = points.length > 0 ? points[points.length - 1].value : null;

  // Auto-seed initial history and auto-subscribe to telemetry stream
  useEffect(() => {
    let mounted = true;
    const currentBuf = useLiveStore.getState().getBuffer(nodeId, metricKey);
    if (!currentBuf || currentBuf.length === 0) {
      void dataSource.getNodeHistory(nodeId, metricKey).then((history) => {
        if (!mounted) return;
        useLiveStore.getState().seedHistory(nodeId, metricKey, history);
      });
    }

    const unsubscribe = dataSource.subscribeToNode(nodeId, (event) => {
      if (!mounted) return;
      useLiveStore.getState().ingestReading(event);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [nodeId, metricKey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    renderStreamingChart(canvas, points, {
      yLabel: title,
      unit,
      warningAbove,
      criticalAbove,
      minExpected,
      maxExpected,
      strokeColor,
    });
  }, [points, title, unit, warningAbove, criticalAbove, minExpected, maxExpected, strokeColor]);

  // Handle container resizing
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(() => {
      renderStreamingChart(canvas, points, {
        yLabel: title,
        unit,
        warningAbove,
        criticalAbove,
        minExpected,
        maxExpected,
        strokeColor,
      });
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [points, title, unit, warningAbove, criticalAbove, minExpected, maxExpected, strokeColor]);

  return (
    <div className="live-chart">
      <div className="live-chart__header">
        <span className="live-chart__title">{title}</span>
        <div className="live-chart__value-badge">
          <span className="live-chart__current-val">
            {latestVal !== null ? latestVal.toFixed(1) : '—'}
          </span>
          <span className="live-chart__unit">{unit}</span>
        </div>
      </div>

      <div ref={containerRef} className="live-chart__canvas-container">
        <canvas ref={canvasRef} className="live-chart__canvas" />
        {points.length === 0 && (
          <div className="live-chart__empty-overlay">
            Waiting for live telemetry stream…
          </div>
        )}
      </div>
    </div>
  );
}
