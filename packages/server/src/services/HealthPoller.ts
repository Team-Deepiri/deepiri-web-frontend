import { getHealthBand } from '@deepiri/shared/utils/statusThresholds';
import type { ServiceHealth, ServiceStatus } from '@deepiri/shared/types';
import { getRegistry } from './RegistryStore.js';

type ServiceDef = {
  id: string;
  name: string;
  healthPath: string;
  port: number;
  category?: string;
  launchUrl?: string;
};

const DEFAULT_API_GATEWAY = process.env.API_GATEWAY_URL ?? 'http://localhost:5100';

export class HealthPoller {
  private cache = new Map<string, ServiceHealth>();
  private timer: ReturnType<typeof setInterval> | null = null;
  private readonly intervalMs: number;
  /** Optional hook — Hub WS relay broadcasts health to Immersive/Portal. */
  onUpdate: ((services: ServiceHealth[]) => void) | null = null;

  constructor(intervalMs = 10_000) {
    this.intervalMs = intervalMs;
  }

  start(): void {
    void this.pollAll();
    this.timer = setInterval(() => {
      void this.pollAll();
    }, this.intervalMs);
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  getAll(): ServiceHealth[] {
    return Array.from(this.cache.values());
  }

  getOne(serviceId: string): ServiceHealth | undefined {
    return this.cache.get(serviceId);
  }

  private async pollAll(): Promise<void> {
    const services = getRegistry().services as ServiceDef[];
    await Promise.all(services.map((svc) => this.pollOne(svc)));
    this.onUpdate?.(this.getAll());
  }

  private async pollOne(svc: ServiceDef): Promise<void> {
    const started = Date.now();
    let status: ServiceStatus;
    let latencyMs: number | null = null;
    let message: string | undefined;

    try {
      const base =
        svc.id === 'api-gateway'
          ? DEFAULT_API_GATEWAY
          : `http://localhost:${svc.port}`;
      const url = `${base.replace(/\/$/, '')}${svc.healthPath}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5_000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      latencyMs = Date.now() - started;
      status = res.ok ? 'up' : 'degraded';
      if (!res.ok) message = `HTTP ${res.status}`;
    } catch (err) {
      latencyMs = Date.now() - started;
      status = 'down';
      message = err instanceof Error ? err.message : 'unreachable';
    }

    const healthBand =
      status === 'down' || status === 'unknown' || latencyMs == null
        ? 'red'
        : getHealthBand(latencyMs);

    this.cache.set(svc.id, {
      serviceId: svc.id,
      name: svc.name,
      status,
      latencyMs,
      healthBand,
      lastChecked: new Date().toISOString(),
      message,
    });
  }
}
