/**
 * NodeIdentityBlock.tsx — Node identification header block.
 * Shows: Node name, type badge, ID, geographic coordinates, and health status.
 * DESIGN.md section 15 (Node Identity Block).
 */

import type { NodeDefinition, NodeHealthState } from '@/types';
import { NodeHealthBadge } from './NodeHealthBadge';
import './NodeIdentityBlock.css';

interface NodeIdentityBlockProps {
  node: NodeDefinition;
  health?: NodeHealthState;
  lastSeen?: string | null;
}

export function NodeIdentityBlock({
  node,
  health = 'normal',
  lastSeen,
}: NodeIdentityBlockProps) {
  const latHemi = node.location.lat >= 0 ? '°N' : '°S';
  const lngHemi = node.location.lng >= 0 ? '°E' : '°W';
  const formattedCoords = `${Math.abs(node.location.lat).toFixed(4)}${latHemi}, ${Math.abs(node.location.lng).toFixed(4)}${lngHemi}`;

  return (
    <div className="node-identity">
      <div className="node-identity__main">
        <div className="node-identity__title-group">
          <span
            className={`node-identity__type-badge node-identity__type-badge--${node.type.toLowerCase()}`}
          >
            {node.type}
          </span>
          <span className="node-identity__id">[{node.id}]</span>
          <h2 className="node-identity__label">{node.label}</h2>
        </div>

        <NodeHealthBadge health={health} />
      </div>

      <div className="node-identity__meta">
        <div className="node-identity__meta-item">
          <span>Location:</span>
          <span className="node-identity__coords">{formattedCoords}</span>
          {node.location.label && <span>({node.location.label})</span>}
        </div>

        {lastSeen && (
          <div className="node-identity__meta-item">
            <span>Last Telemetry:</span>
            <time dateTime={lastSeen} className="node-identity__coords">
              {new Date(lastSeen).toLocaleTimeString()}
            </time>
          </div>
        )}
      </div>
    </div>
  );
}
