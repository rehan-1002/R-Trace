/**
 * DataMode.ts — Type-safe access to DATA_MODE.
 * Controls whether the application consumes mock data, replayed logs, or live WebSocket telemetry.
 * RULES.md section 12 & Master Implementation Plan P12.
 */

export type DataMode = 'mock' | 'replay' | 'live';

export function getDataMode(): DataMode {
  const mode = import.meta.env.VITE_DATA_MODE;
  if (mode === 'live' || mode === 'replay') {
    return mode;
  }
  return 'mock';
}

export const isMockMode = (): boolean => getDataMode() === 'mock';
export const isLiveMode = (): boolean => getDataMode() === 'live';
export const isReplayMode = (): boolean => getDataMode() === 'replay';
