import { apiClient } from "./platformClient";

export interface EcosystemHealth {
  status: "ok" | "degraded";
  registry?: {
    repos: Array<{ id: string; name: string; status: string; lastChecked: string | null }>;
    services: Array<{ name: string; status: string; lastSeen: string | null }>;
  };
  error?: string;
}

export interface JobMetrics {
  status: "ok" | "degraded";
  stats?: Record<string, number>;
  error?: string;
}

export interface TelemetryEvent {
  eventType: string;
  source: string;
  timestamp: string;
  data?: unknown;
}

export async function getEcosystemHealth(): Promise<EcosystemHealth> {
  const res = await apiClient.get<EcosystemHealth>("/api/telemetry/health/ecosystem");
  return res.data;
}

export async function getJobMetrics(): Promise<JobMetrics> {
  const res = await apiClient.get<JobMetrics>("/api/telemetry/metrics/jobs");
  return res.data;
}

export async function getRecentEvents(limit = 50): Promise<TelemetryEvent[]> {
  const res = await apiClient.get<{ events: TelemetryEvent[] }>("/api/telemetry/events/recent", {
    params: { limit },
  });
  return res.data.events;
}
