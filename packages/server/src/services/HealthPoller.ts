import axios from "axios";
import type { ServiceHealth, ServiceStatus } from "@deepiri/shared";
import { STATUS_THRESHOLD_MS, POLL_INTERVALS_MS } from "@deepiri/shared";

const API_GATEWAY_URL = process.env.API_GATEWAY_URL || "http://localhost:5100";

export class HealthPoller {
  private cache: ServiceHealth[] = [];
  private interval: NodeJS.Timeout | null = null;

  start() {
    this.poll();
    this.interval = setInterval(() => this.poll(), POLL_INTERVALS_MS.HEALTH);
    console.log("HealthPoller started");
  }

  stop() {
    if (this.interval) clearInterval(this.interval);
  }

  getAll(): ServiceHealth[] {
    return this.cache;
  }

  getById(serviceId: string): ServiceHealth | undefined {
    return this.cache.find((s) => s.serviceId === serviceId);
  }

  private async poll() {
    try {
      const start = Date.now();
      const res = await axios.get(`${API_GATEWAY_URL}/health/all`, {
        timeout: 5000,
      });
      const responseTime = Date.now() - start;

      if (Array.isArray(res.data)) {
        this.cache = res.data.map((s: any) => ({
          ...s,
          status: this.getStatus(s.responseTime ?? responseTime),
        }));
      }
    } catch {
      // If gateway is unreachable mark all as unknown — don't crash
      this.cache = this.cache.map((s) => ({ ...s, status: "unknown" as ServiceStatus }));
    }
  }

  private getStatus(ms: number): ServiceStatus {
    if (ms < STATUS_THRESHOLD_MS.HEALTHY) return "healthy";
    if (ms < STATUS_THRESHOLD_MS.DEGRADED) return "degraded";
    return "down";
  }
}
