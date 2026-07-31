import { create } from 'zustand';
import { hubClient, type HubServiceHealth } from '../services/hubClient';

export type HealthSample = {
  ts: string;
  latencyMs: number | null;
  status: string;
  healthBand: string;
};

const HISTORY_CAP = 90;

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
        };
        const prev = history[svc.serviceId] ?? [];
        history[svc.serviceId] = [...prev, sample].slice(-HISTORY_CAP);
      }
      set({
        services,
        history,
        immersiveStatus: (data.immersive?.status as 'live' | 'down') ?? 'down',
        lastFetched: ts,
        error: null,
        loading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'health poll failed',
        loading: false,
      });
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
