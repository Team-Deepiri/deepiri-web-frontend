import { useEffect, useRef } from "react";
import { useEventStore } from "@/store/eventStore";
import type { DeepiriEvent } from "@deepiri/shared";

const HUB_WS_URL = import.meta.env.VITE_HUB_WS_URL || "ws://localhost:5200/ws";

export function useEventStream() {
  const addEvent = useEventStore((s) => s.addEvent);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    function connect() {
      const ws = new WebSocket(HUB_WS_URL);
      wsRef.current = ws;

      ws.onmessage = (msg) => {
        try {
          const parsed = JSON.parse(msg.data);
          if (parsed.type === "event") {
            addEvent(parsed.data as DeepiriEvent);
          }
        } catch {
          // Ignore malformed messages
        }
      };

      ws.onclose = () => {
        // Reconnect after 3s
        setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();
    return () => wsRef.current?.close();
  }, [addEvent]);
}
