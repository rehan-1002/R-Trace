/**
 * NodesPage.tsx — Sensor node registry and explorer.
 * Shows browsable list of nodes with type filters and health states.
 * Phase 6 implementation.
 */

import { useEffect, useState } from 'react';
import type { NodeDefinition } from '@/types';
import { dataSource } from '@/data/dataSource';
import { NodeSelector } from '@/nodes/NodeSelector';
import './Page.css';

export function NodesPage() {
  const [nodes, setNodes] = useState<NodeDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    void dataSource.getNodes().then((loadedNodes) => {
      if (!mounted) return;
      setNodes(loadedNodes);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Environmental Node Network</h1>
        <p className="page__subtitle">
          Active multi-hazard sensor deployment ({nodes.length} nodes registered)
        </p>
      </header>

      <div className="page__body">
        {loading ? (
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
            Loading network node topology…
          </p>
        ) : (
          <NodeSelector nodes={nodes} />
        )}
      </div>
    </div>
  );
}
