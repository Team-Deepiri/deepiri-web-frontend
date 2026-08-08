import { useCallback, useEffect } from "react";
import { registryClient } from "@/services/platformClient";
import { useHealthStore } from "@/store/healthStore";
import { POLL_INTERVALS_MS, getStatusFromResponseTime } from "@deepiri/shared";
import type { ServiceHealth } from "@deepiri/shared";

function mapRows(rows: unknown[], fallbackStatus?: ServiceHealth["status"]): ServiceHealth[] {
  return rows.map((entry, i) => {
    const row = entry as Record<string, unknown>;
    const name = String(row.name ?? `service-${i}`);
    const rawStatus = row.status as ServiceHealth["status"] | undefined;
    const status =
      rawStatus === "healthy" || rawStatus === "degraded" || rawStatus === "down"
        ? rawStatus
        : fallbackStatus ?? "unknown";
    return {
      serviceId: name,
      name,
      status,
      port: typeof row.port === "number" ? row.port : 0,
      uptime: 0,
      lastPing: row.lastSeen ? Date.parse(String(row.lastSeen)) || Date.now() : Date.now(),
      responseTime: 0,
    };
  });
}

/**
 * Poll deepiri-registry for service catalog + health.
 * Replaces hub-server HealthPoller (/health/all).
 *
 * Returns `refresh` so callers (e.g. an Ops dashboard's refresh button) can
 * trigger an on-demand poll using the exact same fetch/fallback logic as the
 * background interval, instead of duplicating registry calls elsewhere.
 */
export function useHealthPoll() {
  const { setServices, setLoading } = useHealthStore();

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await registryClient.get("/services");
      const rows = Array.isArray(res.data) ? res.data : [];
      const mapped = mapRows(rows);

      // If registry returned empty, try poll endpoint to refresh then re-list
      if (mapped.length === 0) {
        try {
          await registryClient.post("/poll");
          const again = await registryClient.get("/services");
          const againRows = Array.isArray(again.data) ? again.data : [];
          setServices(mapRows(againRows, getStatusFromResponseTime(999)));
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
  }, [setServices, setLoading]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, POLL_INTERVALS_MS.HEALTH);
    return () => clearInterval(interval);
  }, [refresh]);

  return { refresh };
}