/**
 * NodeSelector.tsx — Browsable list and filter of active sensor nodes.
 * DESIGN.md section 15 (Node Selector).
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { NodeDefinition, NodeType } from '@/types';
import { NodeHealthBadge } from './NodeHealthBadge';
import './NodeSelector.css';

interface NodeSelectorProps {
  nodes: NodeDefinition[];
  selectedNodeId?: string;
}

const FILTER_TYPES: ('ALL' | NodeType)[] = [
  'ALL',
  'FIRE',
  'FLOOD',
  'AQI',
  'LANDSLIDE',
  'INDUSTRIAL',
];

export function NodeSelector({ nodes }: NodeSelectorProps) {
  const [activeFilter, setActiveFilter] = useState<'ALL' | NodeType>('ALL');

  const filteredNodes =
    activeFilter === 'ALL'
      ? nodes
      : nodes.filter((n) => n.type === activeFilter);

  return (
    <div className="node-selector">
      <div className="node-selector__filter-bar" role="toolbar" aria-label="Filter nodes by hazard type">
        {FILTER_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            className={`node-selector__filter-btn${activeFilter === type ? ' node-selector__filter-btn--active' : ''}`}
            onClick={() => setActiveFilter(type)}
          >
            {type === 'ALL' ? 'All Hazards' : type}
          </button>
        ))}
      </div>

      <div className="node-selector__grid" role="list">
        {filteredNodes.map((node) => (
          <Link
            key={node.id}
            to={`/nodes/${node.id}`}
            className="node-card"
            role="listitem"
          >
            <div>
              <div className="node-card__header">
                <span className="node-card__type-tag">{node.type}</span>
                <span className="node-card__id">{node.id}</span>
              </div>
              <h3 className="node-card__title">{node.label}</h3>
              {node.description && <p className="node-card__desc">{node.description}</p>}
            </div>

            <div className="node-card__footer">
              <span>{node.location.label ?? `${node.location.lat.toFixed(2)}°, ${node.location.lng.toFixed(2)}°`}</span>
              <NodeHealthBadge health="normal" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
