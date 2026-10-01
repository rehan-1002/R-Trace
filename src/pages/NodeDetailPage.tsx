/**
 * NodeDetailPage.tsx — Detailed view for a single physical sensor node.
 * Mounts the adaptive NodeViewContainer.
 * Phase 6 implementation.
 */

import { useParams, Navigate } from 'react-router-dom';
import { NodeViewContainer } from '@/nodes/NodeViewContainer';

export function NodeDetailPage() {
  const { nodeId } = useParams<{ nodeId: string }>();

  if (!nodeId) {
    return <Navigate to="/nodes" replace />;
  }

  return <NodeViewContainer nodeId={nodeId} />;
}
