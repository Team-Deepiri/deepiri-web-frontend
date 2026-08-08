import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { useEventStore } from "@/store/eventStore";
import { REALTIME_GATEWAY_URL } from "@/services/platformClient";
import type { DeepiriEvent, EventProducer } from "@deepiri/shared";

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
 * Live events from deepiri-realtime-gateway.
 * Replaces hub-server WebSocketRelay (ws://localhost:5200/ws).
 */
export function useEventStream() {
  const addEvent = useEventStore((s) => s.addEvent);
  const socketRef = useRef<Socket | null>(null);

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
        sourceService: data?.service || data?.source ? String(data.service || data.source) : undefined,
      };
      addEvent(normalized);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [addEvent]);
}
