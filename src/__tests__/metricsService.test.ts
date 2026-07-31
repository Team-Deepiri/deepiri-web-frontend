import { describe, expect, it } from 'vitest';
import { communityEdgeMetric, seedHistory } from '../services/metricsService';
import type { HubServiceHealth } from '../services/hubClient';

describe('metricsService', () => {
  it('seeds historical metric points for charts', () => {
    const svc: HubServiceHealth = {
      serviceId: 'api-gateway',
      name: 'API Gateway',
      status: 'up',
      latencyMs: 120,
      healthBand: 'green',
      lastChecked: new Date().toISOString(),
    };
    const points = seedHistory(svc, 10, 60_000);
    expect(points).toHaveLength(10);
    expect(points[0].requestRate).toBeGreaterThan(0);
    expect(points.at(-1)?.p95Latency).toBeGreaterThan(0);
  });

  it('maps dependency metrics with error boost', () => {
    expect(communityEdgeMetric(3, 'green', 'green', 'volume')).toBe(3);
    expect(communityEdgeMetric(3, 'red', 'red', 'errorRate')).toBeGreaterThan(
      communityEdgeMetric(3, 'green', 'green', 'errorRate')
    );
    expect(communityEdgeMetric(2, 'amber', 'green', 'p95')).toBeGreaterThan(0);
  });
});
