import { io, Socket } from "socket.io-client";
import type { DeepiriEvent, EventProducer } from "@deepiri/shared";

const REALTIME_GATEWAY_URL =
  process.env.REALTIME_GATEWAY_URL || "ws://localhost:5008";

// Simple WebSocket type for connected clients
type WSClient = {
  send: (data: string) => void;
  readyState: number;
};

// Producer detection — map source event types to producer labels
function detectProducer(event: any): EventProducer {
  const src = (event.source || event.service || "").toLowerCase();
  if (src.includes("synapse") || src.includes("matrix")) return "synapse";
  if (src.includes("sugar") || src.includes("glider")) return "sugarGlider";
  if (src.includes("language") || src.includes("nlp") || src.includes("intel"))
    return "languageIntelligence";
  if (src.includes("redis") || src.includes("stream")) return "redisStreams";
  return "realtimeGateway";
}

export class WebSocketRelay {
  private socket: Socket | null = null;
  private clients: Set<WSClient> = new Set();

  connect() {
    this.socket = io(REALTIME_GATEWAY_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: Infinity,
    });

    this.socket.on("connect", () => {
      console.log(`WebSocketRelay connected to realtime-gateway`);
    });

    this.socket.on("disconnect", () => {
      console.warn("WebSocketRelay disconnected from realtime-gateway — will reconnect");
    });

    // Listen for platform events and relay to all connected clients
    this.socket.onAny((eventName: string, data: any) => {
      const normalized: DeepiriEvent = {
        id: data?.id || `${Date.now()}-${Math.random()}`,
        producer: detectProducer(data),
        type: eventName,
        payload: data?.payload || data || {},
        timestamp: data?.timestamp || Date.now(),
        isError:
          data?.isError ||
          eventName.includes("error") ||
          eventName.includes("fail") ||
          false,
        traceId: data?.traceId,
        sourceService: data?.service || data?.source,
      };
      this.broadcast(normalized);
    });

    console.log("WebSocketRelay started");
  }

  addClient(client: WSClient) {
    this.clients.add(client);
  }

  removeClient(client: WSClient) {
    this.clients.delete(client);
  }

  private broadcast(event: DeepiriEvent) {
    const message = JSON.stringify({ type: "event", data: event });
    for (const client of this.clients) {
      if (client.readyState === 1) {
        // 1 = OPEN
        try {
          client.send(message);
        } catch {
          this.clients.delete(client);
        }
      }
    }
  }
}
