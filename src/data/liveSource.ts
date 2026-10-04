/**
 * liveSource.ts — Resilient Live WebSocket and REST telemetry adapter.
 * Connects to the regional edge processor or backend server when VITE_DATA_MODE='live'.
 * Features auto-reconnect backoff, edge status synchronization, and multi-subscriber routing.
 */

import type { NodeDefinition, SensorReadingEvent, DataPoint } from '@/types';
import { getApiUrl, getWsUrl } from '@/utils/network';
import { useConnectionStore } from '@/stores/connection';
import { useLiveStore } from '@/stores/live';

type SensorCallback = (event: SensorReadingEvent) => void;

class LiveDataSource {
  private ws: WebSocket | null = null;
  private subscribers: Map<string, Set<SensorCallback>> = new Map();
  private reconnectTimer: number | null = null;
  private isConnecting = false;

  public async getNodes(): Promise<NodeDefinition[]> {
    const apiUrl = getApiUrl();
    const res = await fetch(`${apiUrl}/api/nodes`);
    if (!res.ok) throw new Error(`Failed to fetch nodes: ${res.statusText}`);
    return res.json() as Promise<NodeDefinition[]>;
  }

  public async getNodeHistory(
    nodeId: string,
    metric: string,
    from?: string,
    to?: string
  ): Promise<DataPoint[]> {
    const apiUrl = getApiUrl();

    const params = new URLSearchParams({ metric, limit: '100' });
    if (from) params.append('from', from);
    if (to) params.append('to', to);

    try {
      const res = await fetch(`${apiUrl}/api/nodes/${nodeId}/history?${params.toString()}`);
      if (!res.ok) return [];
      return (await res.json()) as DataPoint[];
    } catch {
      return [];
    }
  }

  public subscribeToNode(nodeId: string, callback: SensorCallback): () => void {
    if (!this.subscribers.has(nodeId)) {
      this.subscribers.set(nodeId, new Set());
    }
    this.subscribers.get(nodeId)!.add(callback);

    this.connectWs();

    return () => {
      const subs = this.subscribers.get(nodeId);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          this.subscribers.delete(nodeId);
        }
      }
    };
  }

  public connectWs(): void {
    const wsUrl = getWsUrl();
    if (!wsUrl) return;

    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    if (this.isConnecting) return;
    this.isConnecting = true;

    try {
      if (this.reconnectTimer !== null && typeof window !== 'undefined') {
        window.clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnecting = false;
        useConnectionStore.getState().setEdgeStatus('connected');
        useConnectionStore.getState().setReconnecting(false);
      };

      this.ws.onmessage = (event) => {
        useConnectionStore.getState().recordEdgeActivity();
        try {
          const data = JSON.parse(event.data as string) as SensorReadingEvent;
          if (data && data.type === 'SENSOR_READING' && data.nodeId) {
            // Direct store ingestion
            useLiveStore.getState().ingestReading(data);

            // Notify specific node subscribers
            const subs = this.subscribers.get(data.nodeId);
            subs?.forEach((cb) => cb(data));
          }
        } catch {
          // Non-JSON or malformed frame
        }
      };

      this.ws.onclose = () => {
        this.ws = null;
        this.isConnecting = false;
        useConnectionStore.getState().setEdgeStatus('disconnected');
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        useConnectionStore.getState().setEdgeStatus('disconnected');
        this.ws?.close();
      };
    } catch {
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer !== null || typeof window === 'undefined') return;

    useConnectionStore.getState().setReconnecting(true);
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.connectWs();
    }, 2000);
  }
}

export const liveSource = new LiveDataSource();
