import { create } from 'zustand';
import { hubClient, type HubServiceHealth } from '../services/hubClient';

type HealthState = {
  services: HubServiceHealth[];
  immersiveStatus: 'live' | 'down' | 'unknown';
  lastFetched: string | null;
  error: string | null;
  loading: boolean;
  poll: () => Promise<void>;
  startPolling: (intervalMs?: number) => () => void;
};

export const useHealthStore = create<HealthState>((set, get) => ({
  services: [],
  immersiveStatus: 'unknown',
  lastFetched: null,
  error: null,
  loading: false,

  poll: async () => {
    set({ loading: true });
    try {
      const data = await hubClient.getHealthAll();
      set({
        services: data.services ?? [],
        immersiveStatus: (data.immersive?.status as 'live' | 'down') ?? 'down',
        lastFetched: new Date().toISOString(),
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
