/**
 * index.ts — Node configuration registry.
 * Maps every NodeType to its declarative NodeConfig.
 * Master Implementation Plan section 6 (Phase 6).
 */

import type { NodeType } from '@/types';
import type { NodeConfig } from './types';
import { fireConfig } from './fire.config';
import { floodConfig } from './flood.config';
import { aqiConfig } from './aqi.config';
import { landslideConfig } from './landslide.config';
import { industrialConfig } from './industrial.config';

export * from './types';
export { fireConfig, floodConfig, aqiConfig, landslideConfig, industrialConfig };

export const NODE_CONFIGS: Record<NodeType, NodeConfig> = {
  FIRE: fireConfig,
  FLOOD: floodConfig,
  AQI: aqiConfig,
  LANDSLIDE: landslideConfig,
  INDUSTRIAL: industrialConfig,
};

export function getNodeConfig(type: NodeType): NodeConfig {
  const config = NODE_CONFIGS[type];
  if (!config) {
    throw new Error(`No NodeConfig registered for NodeType: "${type}"`);
  }
  return config;
}
