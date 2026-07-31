import type { HubServiceHealth } from './hubClient';
import { getJobMetrics, getRecentEvents, type TelemetryEvent } from './telemetryService';

export type MetricPoint = {
  ts: string;
  label: string;
  requestRate: number;
  errorRate: number;
  p95Latency: number;
  avgLatency: number;
  memoryMb: number;
};

export type ServiceMetricsSeries = {
  serviceId: string;
  name: string;
  points: MetricPoint[];
};

const SERIES_CAP = 120;

/** Deterministic pseudo-metrics so dashboards stay useful without Prometheus. */
function derivePoint(svc: HubServiceHealth, now = Date.now()): MetricPoint {
  const latency = Math.max(1, svc.latencyMs ?? 250);
  const down = svc.status === 'down';
  const degraded = svc.status === 'degraded';
  const seed = hash(`${svc.serviceId}:${Math.floor(now / 10_000)}`);
  const jitter = (seed % 100) / 100;

  const requestRate = down ? 0 : Math.round(40 + (800 / latency) * 8 + jitter * 25);
  const errorRate = down ? 100 : degraded ? 12 + jitter * 20 : jitter * 4;
  const avgLatency = down ? latency : latency * (0.85 + jitter * 0.3);
  const p95Latency = avgLatency * (1.35 + jitter * 0.4);
  const memoryMb = 128 + (seed % 900) + (degraded ? 120 : 0);

  return {
    ts: new Date(now).toISOString(),
    label: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    requestRate,
    errorRate: Math.round(errorRate * 10) / 10,
    p95Latency: Math.round(p95Latency),
    avgLatency: Math.round(avgLatency),
    memoryMb: Math.round(memoryMb),
  };
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Backfill N historical points so Pulse/Ops charts are immediately meaningful. */
export function seedHistory(svc: HubServiceHealth, points = 48, stepMs = 60_000): MetricPoint[] {
  const now = Date.now();
  const out: MetricPoint[] = [];
  for (let i = points - 1; i >= 0; i--) {
    out.push(derivePoint(svc, now - i * stepMs));
  }
  return out;
}

export function appendMetricPoint(
  existing: MetricPoint[] | undefined,
  svc: HubServiceHealth
): MetricPoint[] {
  const prev = existing ?? [];
  const next = [...prev, derivePoint(svc)];
  return next.slice(-SERIES_CAP);
}

export type TelemetryBundle = {
  jobStats: Record<string, number>;
  recentEvents: TelemetryEvent[];
};

export async function fetchTelemetryBundle(): Promise<TelemetryBundle> {
  try {
    const [jobs, events] = await Promise.all([
      getJobMetrics().catch(() => null),
      getRecentEvents(40).catch(() => []),
    ]);
    return {
      jobStats: jobs?.stats ?? {},
      recentEvents: events ?? [],
    };
  } catch {
    return { jobStats: {}, recentEvents: [] };
  }
}

export function communityEdgeMetric(
  edgeCount: number,
  sourceBand: string,
  targetBand: string,
  metric: 'volume' | 'errorRate' | 'avgLatency' | 'p95'
): number {
  const errBoost = (sourceBand === 'red' ? 2 : 0) + (targetBand === 'red' ? 2 : 0)
    + (sourceBand === 'amber' ? 1 : 0) + (targetBand === 'amber' ? 1 : 0);
  if (metric === 'volume') return edgeCount;
  if (metric === 'errorRate') return edgeCount === 0 ? errBoost * 5 : Math.min(100, errBoost * 12 + edgeCount);
  if (metric === 'avgLatency') return Math.round(80 + edgeCount * 15 + errBoost * 40);
  return Math.round(120 + edgeCount * 22 + errBoost * 55); // p95
}
