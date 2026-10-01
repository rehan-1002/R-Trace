/**
 * connection.ts — Zustand store for edge & cloud connectivity.
 * PRD.md section 9, RULES.md section 11.
 * Connection state is explicit and dual-tracked (edge vs cloud).
 */

import { create } from 'zustand';
import type { ConnectionState, ConnectivityStatus } from '@/types';

interface ConnectionStore extends ConnectionState {
  setEdgeStatus: (status: ConnectivityStatus) => void;
  setCloudStatus: (status: ConnectivityStatus) => void;
  recordEdgeActivity: () => void;
  recordCloudActivity: () => void;
  setReconnecting: (reconnecting: boolean) => void;
  reset: () => void;
}

const initialState: ConnectionState = {
  edgeStatus: 'unknown',
  cloudStatus: 'unknown',
  lastEdgeSeen: null,
  lastCloudSeen: null,
  reconnecting: false,
};

export const useConnectionStore = create<ConnectionStore>((set) => ({
  ...initialState,

  setEdgeStatus: (status) =>
    set((state) => ({
      edgeStatus: status,
      lastEdgeSeen: status === 'connected' ? new Date().toISOString() : state.lastEdgeSeen,
    })),

  setCloudStatus: (status) =>
    set((state) => ({
      cloudStatus: status,
      lastCloudSeen: status === 'connected' ? new Date().toISOString() : state.lastCloudSeen,
    })),

  recordEdgeActivity: () =>
    set({
      edgeStatus: 'connected',
      lastEdgeSeen: new Date().toISOString(),
    }),

  recordCloudActivity: () =>
    set({
      cloudStatus: 'connected',
      lastCloudSeen: new Date().toISOString(),
    }),

  setReconnecting: (reconnecting) => set({ reconnecting }),

  reset: () => set(initialState),
}));
