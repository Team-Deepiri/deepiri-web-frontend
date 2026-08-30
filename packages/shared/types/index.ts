export type EventProducer =
  | 'synapse'
  | 'sugarGlider'
  | 'languageIntelligence'
  | 'redisStreams'
  | 'realtimeGateway';

export type HealthBand = 'green' | 'amber' | 'red';

export type ServiceStatus = 'up' | 'down' | 'degraded' | 'unknown';

export interface ServiceHealth {
  serviceId: string;
  name?: string;
  status: ServiceStatus;
  latencyMs: number | null;
  healthBand: HealthBand;
  lastChecked: string;
  message?: string;
}

export interface DeepiriEvent {
  id: string;
  producer: EventProducer;
  type: string;
  timestamp: string;
  payload?: Record<string, unknown>;
  error?: boolean;
}

export interface RepoConfig {
  id: string;
  name: string;
  description?: string;
  sshUrl?: string;
  httpsUrl?: string;
  category?: string;
  tags?: string[];
}
