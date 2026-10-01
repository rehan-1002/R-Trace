/**
 * useConnectionState.ts — React hook for tracking edge and cloud connectivity.
 * Uses shallow equality comparison to prevent infinite re-render loops.
 * PRD.md section 9, RULES.md section 11.
 */

import { useConnectionStore } from '@/stores/connection';
import { useShallow } from 'zustand/react/shallow';
import type { ConnectionState } from '@/types';

export function useConnectionState(): ConnectionState {
  return useConnectionStore(
    useShallow((state) => ({
      edgeStatus: state.edgeStatus,
      cloudStatus: state.cloudStatus,
      lastEdgeSeen: state.lastEdgeSeen,
      lastCloudSeen: state.lastCloudSeen,
      reconnecting: state.reconnecting,
    }))
  );
}
