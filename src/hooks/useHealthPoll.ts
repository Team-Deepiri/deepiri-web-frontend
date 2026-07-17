import { useEffect } from "react";
import { registryClient } from "@/services/platformClient";
import { useHealthStore } from "@/store/healthStore";
import { POLL_INTERVALS_MS, getStatusFromResponseTime } from "@deepiri/shared";
import type { ServiceHealth } from "@deepiri/shared";

/**
 * Poll deepiri-registry for service catalog + health.
 * Replaces hub-server HealthPoller (/health/all).
 */
export function useHealthPoll() {
  const { setServices, setLoading } = useHealthStore();

  useEffect(() => {
    async function poll() {
      try {
        const res = await registryClient.get("/services");
        const rows = Array.isArray(res.data) ? res.data : [];
        const mapped: ServiceHealth[] = rows.map((entry: Record<string, unknown>, i: number) => {
          const status = (entry.status as ServiceHealth["status"]) || "unknown";
          const name = String(entry.name ?? `service-${i}`);
          return {
            serviceId: name,
            name,
            status:
              status === "healthy" || status === "degraded" || status === "down"
                ? status
                : "unknown",
            port: typeof entry.port === "number" ? entry.port : 0,
            uptime: 0,
            lastPing: entry.lastSeen ? Date.parse(String(entry.lastSeen)) || Date.now() : Date.now(),
            responseTime: 0,
          };
        });

        // If registry returned empty, try poll endpoint to refresh then re-list
        if (mapped.length === 0) {
          try {
            await registryClient.post("/poll");
            const again = await registryClient.get("/services");
            const againRows = Array.isArray(again.data) ? again.data : [];
            setServices(
              againRows.map((entry: Record<string, unknown>, i: number) => {
                const name = String(entry.name ?? `service-${i}`);
                const status = (entry.status as ServiceHealth["status"]) || "unknown";
                return {
                  serviceId: name,
                  name,
                  status:
                    status === "healthy" || status === "degraded" || status === "down"
                      ? status
                      : getStatusFromResponseTime(999),
                  port: typeof entry.port === "number" ? entry.port : 0,
                  uptime: 0,
                  lastPing: Date.now(),
                  responseTime: 0,
                };
              })
            );
            return;
          } catch {
            /* keep empty */
          }
        }

        setServices(mapped);
      } catch {
        // Silently fail — UI shows last known state
      } finally {
        setLoading(false);
      }
    }

    setLoading(true);
    poll();
    const interval = setInterval(poll, POLL_INTERVALS_MS.HEALTH);
    return () => clearInterval(interval);
  }, [setServices, setLoading]);
}
