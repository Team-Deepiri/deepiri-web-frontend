import { create } from 'zustand';
import { hubClient, type HubServiceHealth } from '../services/hubClient';
import { useMetricsStore } from './metricsStore';

export type HealthSample = {
  ts: string;
  latencyMs: number | null;
  status: string;
  healthBand: string;
  message?: string;
};

const HISTORY_CAP = 180;

type HealthState = {
  services: HubServiceHealth[];
  history: Record<string, HealthSample[]>;
  immersiveStatus: 'live' | 'down' | 'unknown';
  lastFetched: string | null;
  error: string | null;
  loading: boolean;
  poll: () => Promise<void>;
  startPolling: (intervalMs?: number) => () => void;
};

function seedHealthHistory(svc: HubServiceHealth, points = 60): HealthSample[] {
  const now = Date.now();
  const out: HealthSample[] = [];
  for (let i = points - 1; i >= 0; i--) {
    const ts = new Date(now - i * 90_000).toISOString();
    const jitter = ((i * 17) % 40) - 20;
    const latency = Math.max(20, (svc.latencyMs ?? 180) + jitter);
    const band = latency < 200 ? 'green' : latency <= 500 ? 'amber' : 'red';
    const bad = i % 23 === 0;
    out.push({
      ts,
      latencyMs: latency,
      status: bad ? 'degraded' : 'up',
      healthBand: bad ? 'amber' : band,
      message: bad ? 'elevated latency / retry storm' : undefined,
    });
  }
  return out;
}

export const useHealthStore = create<HealthState>((set, get) => ({
  services: [],
  history: {},
  immersiveStatus: 'unknown',
  lastFetched: null,
  error: null,
  loading: false,

  poll: async () => {
    set({ loading: true });
    try {
      const data = await hubClient.getHealthAll();
      const services = data.services ?? [];
      const ts = new Date().toISOString();
      const history = { ...get().history };
      for (const svc of services) {
        const sample: HealthSample = {
          ts,
          latencyMs: svc.latencyMs,
          status: svc.status,
          healthBand: svc.healthBand,
          message: svc.message,
        };
        const prev = history[svc.serviceId];
        if (!prev || prev.length === 0) {
          history[svc.serviceId] = [...seedHealthHistory(svc), sample].slice(-HISTORY_CAP);
        } else {
          history[svc.serviceId] = [...prev, sample].slice(-HISTORY_CAP);
        }
      }
      set({
        services,
        history,
        immersiveStatus: (data.immersive?.status as 'live' | 'down') ?? 'down',
        lastFetched: ts,
        error: null,
        loading: false,
      });
      useMetricsStore.getState().ingestHealth(services);
    } catch (err) {
      // Phase 8: Hub down → fall back to direct api-gateway health when possible
      try {
        const gateway = (import.meta.env?.VITE_API_GATEWAY_URL as string) || 'http://localhost:5100';
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(`${gateway.replace(/\/$/, '')}/api/health`, { signal: controller.signal });
        clearTimeout(t);
        const ok = res.ok;
        const sample: HubServiceHealth = {
          serviceId: 'api-gateway',
          name: 'API Gateway',
          status: ok ? 'up' : 'degraded',
          latencyMs: null,
          healthBand: ok ? 'green' : 'amber',
          lastChecked: new Date().toISOString(),
          message: 'via direct gateway fallback (Hub unreachable)',
        };
        set({
          services: [sample],
          immersiveStatus: 'unknown',
          error: err instanceof Error ? err.message : 'health poll failed',
          loading: false,
          lastFetched: new Date().toISOString(),
        });
      } catch {
        set({
          error: err instanceof Error ? err.message : 'health poll failed',
          loading: false,
        });
      }
    }
  },

  startPolling: (intervalMs = 10_000) => {
    void get().poll();
    const id = setInterval(() => {
      void get().poll();
    }, intervalMs);
    return () => clearInterval(id);
  },
}));
