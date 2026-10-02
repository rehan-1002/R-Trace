/**
 * dataSource.ts — Unified data abstraction layer.
 * All UI components interact with this interface — they NEVER import mock data directly.
 * RULES.md section 12, Master Implementation Plan P12 & Phase 5.
 */

import type { NodeDefinition, SensorReadingEvent, DataPoint } from '@/types';
import { isLiveMode } from './DataMode';
import { liveSource } from './liveSource';
import { getMockNodes, getMockNode, generateMockHistory } from './mockStore';
import { mockEmitter } from './mockEmitter';

export interface DataSource {
  getNodes(): Promise<NodeDefinition[]>;
  getNode(nodeId: string): Promise<NodeDefinition | undefined>;
  getNodeHistory(
    nodeId: string,
    metric: string,
    from?: string,
    to?: string
  ): Promise<DataPoint[]>;
  subscribeToNode(
    nodeId: string,
    callback: (event: SensorReadingEvent) => void
  ): () => void;
}

class DataSourceManager implements DataSource {
  public async getNodes(): Promise<NodeDefinition[]> {
    if (isLiveMode()) {
      try {
        return await liveSource.getNodes();
      } catch (err) {
        console.warn('Failed to fetch live nodes, falling back to cached/mock registry', err);
        return getMockNodes();
      }
    }
    return getMockNodes();
  }

  public async getNode(nodeId: string): Promise<NodeDefinition | undefined> {
    const nodes = await this.getNodes();
    return nodes.find((n) => n.id === nodeId) ?? getMockNode(nodeId);
  }

  public async getNodeHistory(
    nodeId: string,
    metric: string,
    from?: string,
    to?: string
  ): Promise<DataPoint[]> {
    if (isLiveMode()) {
      try {
        return await liveSource.getNodeHistory(nodeId, metric, from, to);
      } catch (err) {
        console.warn('Failed to fetch live history from server, starting empty', err);
        return [];
      }
    }
    return generateMockHistory(nodeId, metric);
  }

  public subscribeToNode(
    nodeId: string,
    callback: (event: SensorReadingEvent) => void
  ): () => void {
    if (isLiveMode()) {
      return liveSource.subscribeToNode(nodeId, callback);
    }
    return mockEmitter.subscribe(nodeId, callback);
  }
}

export const dataSource: DataSource = new DataSourceManager();
