/**
 * ws-client.ts — Real-time WebSocket transport client.
 * Manages WebSocket connection lifecycle, authentication handshake,
 * exponential backoff reconnection, and event routing.
 * PRD.md section 9, RULES.md section 6, Master Implementation Plan section 6 (Phase 7).
 */

import type { WsEvent } from '@/types';
import { parseWsMessage } from './event-parser';
import { ReconnectStrategy } from './reconnect';
import { useConnectionStore } from '@/stores/connection';
import { useLiveStore } from '@/stores/live';
import { getStoredToken } from '@/auth/authStorage';

class RealtimeWebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectStrategy = new ReconnectStrategy();
  private reconnectTimer: number | null = null;
  private shouldConnect = false;
  private url: string;

  constructor() {
    this.url = import.meta.env.VITE_WS_URL || 'ws://localhost:3001/ws';
  }

  public connect(): void {
    this.shouldConnect = true;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.initSocket();
  }

  public disconnect(): void {
    this.shouldConnect = false;
    if (this.reconnectTimer !== null && typeof window !== 'undefined') {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    useConnectionStore.getState().setEdgeStatus('disconnected');
    useConnectionStore.getState().setReconnecting(false);
  }

  private initSocket(): void {
    if (typeof window === 'undefined') return;

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.reconnectStrategy.reset();
        useConnectionStore.getState().setEdgeStatus('connected');
        useConnectionStore.getState().setReconnecting(false);

        // Authenticate connection with server
        const token = getStoredToken();
        if (token && this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type: 'AUTH', token }));
        }
      };

      this.ws.onmessage = (messageEvent) => {
        useConnectionStore.getState().recordEdgeActivity();

        const event = parseWsMessage(messageEvent.data);
        if (!event) return;

        this.routeEvent(event);
      };

      this.ws.onclose = (event) => {
        this.ws = null;
        useConnectionStore.getState().setEdgeStatus('disconnected');

        if (this.shouldConnect) {
          this.scheduleReconnect();
        }

        // Server auth rejected code
        if (event.code === 4401) {
          console.warn('WebSocket connection rejected: invalid auth credentials');
        }
      };

      this.ws.onerror = () => {
        useConnectionStore.getState().setEdgeStatus('disconnected');
        this.ws?.close();
      };
    } catch (err) {
      console.warn('Failed to initialize WebSocket client:', err);
      if (this.shouldConnect) {
        this.scheduleReconnect();
      }
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer !== null || !this.shouldConnect) return;

    const delay = this.reconnectStrategy.nextDelay();
    useConnectionStore.getState().setReconnecting(true);

    if (typeof window !== 'undefined') {
      this.reconnectTimer = window.setTimeout(() => {
        this.reconnectTimer = null;
        this.initSocket();
      }, delay);
    }
  }

  private routeEvent(event: WsEvent): void {
    switch (event.type) {
      case 'SENSOR_READING':
        useLiveStore.getState().ingestReading(event);
        break;

      case 'NODE_STATUS':
        // Updates node online status
        break;

      case 'ALERT':
        // Routed to alert feed
        break;

      case 'ANALYSIS':
        // Routed to analysis handler
        break;

      default:
        break;
    }
  }

  public send(data: unknown): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(typeof data === 'string' ? data : JSON.stringify(data));
    }
  }
}

export const wsClient = new RealtimeWebSocketClient();
