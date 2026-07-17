import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { useSceneStore } from "@/immersive/store/sceneStore";
import { registryClient, REALTIME_GATEWAY_URL } from "@/services/platformClient";
import type { DeepiriEvent, EventProducer, ServiceHealth } from "@deepiri/shared";
import { POLL_INTERVALS_MS } from "@deepiri/shared";

function detectProducer(event: Record<string, unknown>): EventProducer {
  const src = String(event.source || event.service || "").toLowerCase();
  if (src.includes("synapse") || src.includes("matrix")) return "synapse";
  if (src.includes("sugar") || src.includes("glider")) return "sugarGlider";
  if (src.includes("language") || src.includes("nlp") || src.includes("intel"))
    return "languageIntelligence";
  if (src.includes("redis") || src.includes("stream")) return "redisStreams";
  return "realtimeGateway";
}

/**
 * Immersive data plane: registry for health, realtime-gateway for events.
 * Replaces hub-server REST + WS relay.
 */
export function useHubConnection() {
  const { setServices, addEvent } = useSceneStore();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    async function fetchHealth() {
      try {
        const res = await registryClient.get("/services");
        const rows = Array.isArray(res.data) ? res.data : [];
        const mapped: ServiceHealth[] = rows.map((entry: Record<string, unknown>, i: number) => {
          const name = String(entry.name ?? `service-${i}`);
          const status = (entry.status as ServiceHealth["status"]) || "unknown";
          return {
            serviceId: name,
            name,
            status:
              status === "healthy" || status === "degraded" || status === "down"
                ? status
                : "unknown",
            port: typeof entry.port === "number" ? entry.port : 0,
            uptime: 0,
            lastPing: Date.now(),
            responseTime: 0,
          };
        });
        setServices(mapped);
      } catch {
        /* keep last known state */
      }
    }
    fetchHealth();
    const interval = setInterval(fetchHealth, POLL_INTERVALS_MS.HEALTH);
    return () => clearInterval(interval);
  }, [setServices]);

  useEffect(() => {
    const socket = io(REALTIME_GATEWAY_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: Infinity,
    });
    socketRef.current = socket;

    socket.onAny((eventName: string, data: Record<string, unknown> = {}) => {
      const normalized: DeepiriEvent = {
        id: String(data?.id || `${Date.now()}-${Math.random()}`),
        producer: detectProducer(data),
        type: eventName,
        payload: (data?.payload as Record<string, unknown>) || data || {},
        timestamp: typeof data?.timestamp === "number" ? data.timestamp : Date.now(),
        isError:
          Boolean(data?.isError) ||
          eventName.includes("error") ||
          eventName.includes("fail"),
        traceId: data?.traceId ? String(data.traceId) : undefined,
        sourceService:
          data?.service || data?.source ? String(data.service || data.source) : undefined,
      };
      addEvent(normalized);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [addEvent]);
}
