export type ServiceStatus = "healthy" | "degraded" | "down" | "unknown";

export interface ServiceHealth {
  serviceId: string;
  name: string;
  status: ServiceStatus;
  port: number;
  uptime: number;
  lastPing: number;
  responseTime: number;
}

export type EventProducer =
  | "synapse"
  | "sugarGlider"
  | "languageIntelligence"
  | "redisStreams"
  | "realtimeGateway";

export interface DeepiriEvent {
  id: string;
  producer: EventProducer;
  type: string;
  payload: Record<string, unknown>;
  timestamp: number;
  isError: boolean;
  traceId?: string;
  sourceService?: string;
}

export interface RepoConfig {
  id: string;
  name: string;
  description: string;
  category: "Platform" | "AI" | "Comms" | "Tooling" | "Experimental";
  stack: string[];
  port: number | null;
  hasUI: boolean;
  uiPath?: string;
  gitUrl: string;
  cloneSSH: string;
  cloneHTTPS: string;
  status: "running" | "stopped" | "unknown";
}

export interface ImmersiveStatus {
  status: "live" | "down";
  checkedAt: number;
}

export interface RegistryEntry extends RepoConfig {
  lastUpdated: number;
  contributors?: number;
  lastCommit?: string;
}
