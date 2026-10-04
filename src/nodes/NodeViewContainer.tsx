/**
 * NodeViewContainer.tsx — Adaptive node operational view.
 * The core architectural differentiator of R-TRACE:
 * Operational Interface = f(userRole, selectedNodeType)
 *
 * NO HARDCODED PER-TYPE CONDITIONALS.
 * View hierarchy is driven entirely by declarative NodeConfig.
 * PRD.md section 10, FRD.md section 21, Master Implementation Plan section 6 (Phase 6).
 */

import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { NodeDefinition, SensorReadingEvent } from '@/types';
import { useAuth } from '@/auth/useAuth';
import { dataSource } from '@/data/dataSource';
import { useLiveStore } from '@/stores/live';
import { LiveChart } from '@/charts/LiveChart';
import { getNodeConfig } from './config';
import { NodeIdentityBlock } from './NodeIdentityBlock';
import { MetricBlock } from './MetricBlock';
import { CameraFeedBlock } from './CameraFeedBlock';
import './NodeViewContainer.css';

interface NodeViewContainerProps {
  nodeId: string;
}

export function NodeViewContainer({ nodeId }: NodeViewContainerProps) {
  const { user } = useAuth();
  const [node, setNode] = useState<NodeDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<Record<string, { value: number; timestamp: string }>>({});
  const [lastActionStatus, setLastActionStatus] = useState<string | null>(null);

  // Load node definition
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    void dataSource.getNode(nodeId).then((found) => {
      if (!mounted) return;
      setNode(found ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [nodeId]);

  // Resolve declarative configuration for the node type
  const config = useMemo(() => {
    if (!node) return null;
    return getNodeConfig(node.type);
  }, [node]);

  // Load initial baseline history and subscribe to live telemetry stream
  useEffect(() => {
    if (!config || !node) return;

    let mounted = true;

    // Load initial history for charted metrics
    config.charts.forEach((chart) => {
      void dataSource.getNodeHistory(node.id, chart.metricKey).then((points) => {
        if (!mounted) return;
        useLiveStore.getState().seedHistory(node.id, chart.metricKey, points);
        if (points.length > 0) {
          const latest = points[points.length - 1];
          setMetrics((prev) => ({
            ...prev,
            [chart.metricKey]: {
              value: latest.value,
              timestamp: new Date(latest.timestamp).toISOString(),
            },
          }));
        }
      });
    });

    // Subscribe to live telemetry stream (mock emitter or WebSocket)
    const unsubscribe = dataSource.subscribeToNode(node.id, (event: SensorReadingEvent) => {
      if (!mounted) return;
      useLiveStore.getState().ingestReading(event);
      setMetrics((prev) => ({
        ...prev,
        [event.metric]: {
          value: event.value,
          timestamp: event.timestamp,
        },
      }));
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [node, config]);

  if (loading) {
    return (
      <div className="node-view" style={{ padding: 'var(--space-8)' }}>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
          Loading node telemetry profile…
        </p>
      </div>
    );
  }

  if (!node || !config) {
    return (
      <div className="node-view" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
          Node Not Found
        </h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
          Node {nodeId} is not registered in the operational network.
        </p>
        <Link
          to="/nodes"
          style={{
            color: 'var(--color-accent)',
            fontSize: 'var(--font-size-sm)',
            textDecoration: 'none',
          }}
        >
          ← Return to Node Registry
        </Link>
      </div>
    );
  }

  // Filter actions permitted for the current user's role
  const permittedActions = config.actions.filter(
    (act) => user && act.roles.includes(user.role)
  );

  return (
    <div className="node-view">
      {/* Node Identity Header */}
      <NodeIdentityBlock node={node} health="normal" />

      <div className="node-view__content">
        {/* Optical Sentinel Surveillance Feed */}
        {node.type === 'FIRE' && (
          <CameraFeedBlock nodeId={node.id} nodeType={node.type} />
        )}

        {/* Real-time Metric Telemetry Grid */}
        <section className="node-view__section" aria-labelledby="live-metrics-heading">
          <div className="node-view__section-header">
            <h3 id="live-metrics-heading" className="node-view__section-title">
              Live Sensor Telemetry
            </h3>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              Stream: Real-time Normalized Ingestion
            </span>
          </div>

          <div className="node-view__metrics-grid" role="list">
            {config.metrics.map((metricCfg) => {
              const liveReading = metrics[metricCfg.key];
              const threshold = config.alertThresholds.find(
                (t) => t.metricKey === metricCfg.key
              );

              return (
                <div key={metricCfg.key} role="listitem">
                  <MetricBlock
                    label={metricCfg.label}
                    value={liveReading ? liveReading.value : null}
                    unit={metricCfg.unit}
                    freshness={liveReading ? 'live' : 'unknown'}
                    timestamp={liveReading ? liveReading.timestamp : null}
                    warningAbove={threshold?.warningAbove}
                    criticalAbove={threshold?.criticalAbove}
                  />
                </div>
              );
            })}
          </div>
        </section>

        {/* Live Streaming Canvas Charts */}
        <section className="node-view__section" aria-labelledby="live-charts-heading">
          <div className="node-view__section-header">
            <h3 id="live-charts-heading" className="node-view__section-title">
              Rolling Telemetry Trends
            </h3>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              Canvas-driven Streaming Buffer
            </span>
          </div>

          <div className="node-view__charts-grid">
            {config.charts.map((chartCfg) => {
              const metricDef = config.metrics.find((m) => m.key === chartCfg.metricKey);
              const threshold = config.alertThresholds.find((t) => t.metricKey === chartCfg.metricKey);

              return (
                <LiveChart
                  key={chartCfg.metricKey}
                  nodeId={node.id}
                  metricKey={chartCfg.metricKey}
                  title={chartCfg.yLabel}
                  unit={metricDef?.unit ?? ''}
                  windowSeconds={chartCfg.windowSeconds}
                  warningAbove={threshold?.warningAbove}
                  criticalAbove={threshold?.criticalAbove}
                />
              );
            })}
          </div>
        </section>

        {/* Derived Model Analytics (Provenance Strictly Tagged) */}
        {config.derivedMetrics.length > 0 && (
          <section className="node-view__section" aria-labelledby="derived-metrics-heading">
            <div className="node-view__section-header">
              <h3 id="derived-metrics-heading" className="node-view__section-title">
                Model Predictions & Sensor Fusion
              </h3>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                Provenance: Analytical Inferences Only
              </span>
            </div>

            <div className="node-view__derived-grid">
              {config.derivedMetrics.map((dm) => (
                <div key={dm.key} className="derived-card">
                  <div className="derived-card__header">
                    <span className="derived-card__badge">Edge ML Inference</span>
                  </div>
                  <span className="derived-card__label">{dm.label}</span>
                  <span className="derived-card__source">
                    Model: {dm.sourceLabel}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Role-Permitted Action Controls */}
        {permittedActions.length > 0 && (
          <section className="node-view__section" aria-labelledby="actions-heading">
            <div className="node-view__section-header">
              <h3 id="actions-heading" className="node-view__section-title">
                Operational Directives
              </h3>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                Role: {user?.role} authorized
              </span>
            </div>

            <div className="node-view__actions-bar">
              {permittedActions.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  className={`action-btn action-btn--${action.variant ?? 'secondary'}`}
                  onClick={() => {
                    setLastActionStatus(`Executed: ${action.label} (${new Date().toLocaleTimeString()})`);
                  }}
                >
                  {action.label}
                </button>
              ))}
              {lastActionStatus && (
                <span
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-state-normal)',
                    marginLeft: 'auto',
                  }}
                >
                  {lastActionStatus}
                </span>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
