import type { EventProducer, ServiceStatus } from "../types";

export const PRODUCER_COLORS: Record<EventProducer, string> = {
  synapse: "#06B6D4",
  sugarGlider: "#F97316",
  languageIntelligence: "#8B5CF6",
  redisStreams: "#F59E0B",
  realtimeGateway: "#22C55E",
};

export const PRODUCER_LABELS: Record<EventProducer, string> = {
  synapse: "Synapse",
  sugarGlider: "Sugar Glider",
  languageIntelligence: "Language Intelligence",
  redisStreams: "Redis Streams",
  realtimeGateway: "Realtime Gateway",
};

export const STATUS_COLORS: Record<ServiceStatus, string> = {
  healthy: "#22C55E",
  degraded: "#F59E0B",
  down: "#EF4444",
  unknown: "#94A3B8",
};

export const STATUS_THRESHOLD = {
  HEALTHY_MS: 200,
  DEGRADED_MS: 500,
};

export function getStatusFromResponseTime(ms: number): ServiceStatus {
  if (ms < STATUS_THRESHOLD.HEALTHY_MS) return "healthy";
  if (ms < STATUS_THRESHOLD.DEGRADED_MS) return "degraded";
  return "down";
}
