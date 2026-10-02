/**
 * DashboardPage.tsx — Role-adaptive operational overview.
 * Displays high-level system state, featured demonstrator (Fire Node FN-001),
 * multi-hazard node topology, and role-authorized operational shortcuts.
 * PRD.md section 10, FRD.md section 15-18.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/auth/useAuth';
import { dataSource } from '@/data/dataSource';
import type { NodeDefinition } from '@/types';
import { NodeSelector } from '@/nodes/NodeSelector';
import { LiveChart } from '@/charts/LiveChart';
import { getWsUrl } from '@/utils/network';
import './Page.css';

function getRealLocationLabel(lat?: number, lng?: number, fallbackLabel?: string): string {
  if (lat && lng) {
    if (lat >= 19.15 && lat <= 19.26 && lng >= 73.08 && lng <= 73.25) {
      return 'Dombivli / Kalyan (Thane), Maharashtra';
    }
    if (lat >= 18.90 && lat <= 19.35 && lng >= 72.75 && lng <= 73.35) {
      return 'Mumbai Metropolitan Region, Maharashtra';
    }
    return `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
  }
  return fallbackLabel || 'Dombivli / Kalyan (Thane), Maharashtra';
}

export function DashboardPage() {
  const { user } = useAuth();
  const [nodes, setNodes] = useState<NodeDefinition[]>([]);
  const [placeLabel, setPlaceLabel] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    void dataSource.getNodes().then((loaded) => {
      if (mounted) setNodes(loaded);
    });

    // Real-time WebSocket listener for GPS location updates
    const wsUrl = getWsUrl();
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(wsUrl);
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'NODE_STATUS' && msg.nodeId && msg.location) {
            setNodes((prev) =>
              prev.map((n) =>
                n.id === msg.nodeId
                  ? {
                      ...n,
                      label: msg.nodeLabel || n.label,
                      location: {
                        lat: msg.location.lat,
                        lng: msg.location.lng,
                        label: msg.location.label || n.location.label,
                      },
                    }
                  : n
              )
            );
            if (msg.location.label) {
              setPlaceLabel(msg.location.label);
            }
          }
        } catch {}
      };
    } catch {}

    return () => {
      mounted = false;
      ws?.close();
    };
  }, []);

  const fnNode = nodes.find((n) => n.id === 'FN-001');

  // Reverse geocode real GPS coordinates
  useEffect(() => {
    if (!fnNode?.location?.lat || !fnNode?.location?.lng) return;
    const { lat, lng } = fnNode.location;

    let active = true;
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data?.address) return;
        const addr = data.address;
        const sub = addr.suburb || addr.neighbourhood || addr.residential || addr.town || addr.city_district || addr.city;
        const city = addr.city || addr.town || addr.county || addr.state_district || 'Maharashtra';
        const formatted = sub ? `${sub}, ${city}` : city;
        if (formatted) setPlaceLabel(formatted);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [fnNode?.location?.lat, fnNode?.location?.lng]);

  const displayLocation = placeLabel || getRealLocationLabel(fnNode?.location?.lat, fnNode?.location?.lng, fnNode?.location?.label);

  return (
    <div className="page">
      <header className="page__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page__title">Operational Command Center</h1>
          <p className="page__subtitle">
            {roleLabel(user?.role)} • Real-time Environmental Telemetry Stream
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Link
            to="/nodes/FN-001"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: 'var(--space-2) var(--space-4)',
              backgroundColor: 'var(--color-node-fire)',
              color: 'hsl(215 16% 9%)',
              fontWeight: 'var(--font-weight-semibold)',
              fontSize: 'var(--font-size-xs)',
              borderRadius: 'var(--radius-sm)',
              textDecoration: 'none',
              letterSpacing: 'var(--letter-spacing-wide)',
              textTransform: 'uppercase',
            }}
          >
            Launch Fire Demonstrator (FN-001) →
          </Link>
        </div>
      </header>

      <div className="page__body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {/* KPI Strip */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-4)',
          }}
          aria-label="System status metrics"
        >
          <KpiCard label="Network Nodes" value={`${nodes.length} Active`} subtext="5 Hazard Sensor Types" />
          <KpiCard label="Edge Processor" value="Online" subtext="Regional LAN Synced" state="normal" />
          <KpiCard label="Telemetry Ingestion" value="60 FPS Stream" subtext="Normalized SENSOR_READING" state="normal" />
          <KpiCard label="Primary Demonstrator" value="FN-001" subtext={displayLocation} state="warning" />
        </section>

        {/* Featured Demonstration: Live Wildfire Sentinel */}
        <section
          style={{
            padding: 'var(--space-5)',
            backgroundColor: 'var(--color-surface-raised)',
            border: '1px solid var(--color-surface-border)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 'bold',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'hsl(18 90% 15%)',
                    color: 'var(--color-node-fire)',
                    border: '1px solid hsl(18 90% 30%)',
                    textTransform: 'uppercase',
                  }}
                >
                  Live Hardware Node
                </span>
                <h2 style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-text-primary)' }}>
                  Fire Sentinel (FN-001) — {displayLocation}
                </h2>
              </div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                Active Wildfire Sentinel • Real-Time GPS: {fnNode?.location ? `${fnNode.location.lat.toFixed(6)}°N, ${fnNode.location.lng.toFixed(6)}°E` : '19.201149°N, 73.162719°E'}
                {` • ${displayLocation}`}
              </p>
            </div>
            <Link
              to="/nodes/FN-001"
              style={{
                color: 'var(--color-accent)',
                fontSize: 'var(--font-size-sm)',
                textDecoration: 'none',
              }}
            >
              Open Full Adaptive View →
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'var(--space-4)',
            }}
          >
            <LiveChart
              nodeId="FN-001"
              metricKey="temperature"
              title="Ambient Temperature"
              unit="°C"
              warningAbove={48}
              criticalAbove={62}
              strokeColor="var(--color-node-fire)"
            />
            <LiveChart
              nodeId="FN-001"
              metricKey="humidity"
              title="Relative Humidity"
              unit="%"
              strokeColor="hsl(190 90% 50%)"
            />
            <LiveChart
              nodeId="FN-001"
              metricKey="smoke"
              title="Smoke / Combustion Gas"
              unit="ppm"
              warningAbove={220}
              criticalAbove={420}
              strokeColor="hsl(38 90% 52%)"
            />
          </div>
        </section>

        {/* Multi-hazard Node Registry */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wide)' }}>
            Network Node Registry
          </h2>
          <NodeSelector nodes={nodes} />
        </section>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  subtext,
  state,
}: {
  label: string;
  value: string;
  subtext: string;
  state?: 'normal' | 'warning' | 'critical';
}) {
  const valueColor =
    state === 'normal'
      ? 'var(--color-state-normal)'
      : state === 'warning'
        ? 'var(--color-state-warning)'
        : state === 'critical'
          ? 'var(--color-state-critical)'
          : 'var(--color-text-primary)';

  return (
    <div
      style={{
        padding: 'var(--space-4)',
        backgroundColor: 'var(--color-surface-raised)',
        border: '1px solid var(--color-surface-border)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-1)',
      }}
    >
      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wide)' }}>
        {label}
      </span>
      <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: valueColor, fontFamily: 'var(--font-family-base)', fontFeatureSettings: 'var(--font-feature-tnum)' }}>
        {value}
      </span>
      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
        {subtext}
      </span>
    </div>
  );
}

function roleLabel(role?: string): string {
  switch (role) {
    case 'ADMIN': return 'System Administrator';
    case 'AUTHORITY': return 'Disaster Management Authority';
    case 'WORKER': return 'Field Response Worker';
    case 'CITIZEN': return 'Public Citizen';
    default: return 'Operational User';
  }
}
