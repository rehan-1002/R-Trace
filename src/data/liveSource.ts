/**
 * liveSource.ts — Live WebSocket and REST telemetry adapter.
 * Connects to the regional edge processor or backend server when VITE_DATA_MODE='live'.
 * Full WebSocket resilience, reconnect backoff, and buffering are completed in Phase 7.
 */

import type { NodeDefinition, SensorReadingEvent, DataPoint } from '@/types';
import { getApiUrl, getWsUrl } from '@/utils/network';

type SensorCallback = (event: SensorReadingEvent) => void;

class LiveDataSource {
  private ws: WebSocket | null = null;
  private subscribers: Map<string, Set<SensorCallback>> = new Map();

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

  private connectWs() {
    const wsUrl = getWsUrl();
    if (!wsUrl || this.ws) return;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data as string) as SensorReadingEvent;
          if (data && data.type === 'SENSOR_READING' && data.nodeId) {
            const subs = this.subscribers.get(data.nodeId);
            subs?.forEach((cb) => cb(data));
          }
        } catch {
          // Non-JSON or malformed frame
        }
      };

      this.ws.onclose = () => {
        this.ws = null;
      };

      this.ws.onerror = () => {
        this.ws?.close();
      };
    } catch (e) {
      console.warn('Failed to initialize WebSocket client:', e);
    }
  }
}

export const liveSource = new LiveDataSource();
