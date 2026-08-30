import type { HealthBand } from '../types/index.js';

export const LATENCY_THRESHOLDS_MS = {
  green: 200,
  amber: 500,
} as const;

export function getHealthBand(latencyMs: number | null): HealthBand {
  if (latencyMs === null || latencyMs < 0) {
    return 'red';
  }
  if (latencyMs < LATENCY_THRESHOLDS_MS.green) {
    return 'green';
  }
  if (latencyMs <= LATENCY_THRESHOLDS_MS.amber) {
    return 'amber';
  }
  return 'red';
}
