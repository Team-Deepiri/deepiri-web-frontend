import { create } from 'zustand';
import {
  appendMetricPoint,
  fetchTelemetryBundle,
  seedHistory,
  type MetricPoint,
  type TelemetryBundle,
} from '../services/metricsService';
import type { HubServiceHealth } from '../services/hubClient';

type MetricsState = {
  series: Record<string, MetricPoint[]>;
  telemetry: TelemetryBundle;
  lastUpdated: string | null;
  ingestHealth: (services: HubServiceHealth[]) => void;
  refreshTelemetry: () => Promise<void>;
  startTelemetryPolling: (intervalMs?: number) => () => void;
};

export const useMetricsStore = create<MetricsState>((set, get) => ({
  series: {},
  telemetry: { jobStats: {}, recentEvents: [] },
  lastUpdated: null,

  ingestHealth: (services) => {
    const series = { ...get().series };
    for (const svc of services) {
      if (!series[svc.serviceId] || series[svc.serviceId].length === 0) {
        series[svc.serviceId] = seedHistory(svc, 60, 90_000);
      } else {
        series[svc.serviceId] = appendMetricPoint(series[svc.serviceId], svc);
      }
    }
    set({ series, lastUpdated: new Date().toISOString() });
  },

  refreshTelemetry: async () => {
    const telemetry = await fetchTelemetryBundle();
    set({ telemetry, lastUpdated: new Date().toISOString() });
  },

  startTelemetryPolling: (intervalMs = 30_000) => {
    void get().refreshTelemetry();
    const id = setInterval(() => {
      void get().refreshTelemetry();
    }, intervalMs);
    return () => clearInterval(id);
  },
}));
