import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { REALTIME_GATEWAY_URL } from "@/services/platformClient";
import { useAuthStore } from "@/store/authStore";

export type PresencePeer = {
  id: string;
  name: string;
  lastSeen: number;
};

const PRESENCE_EVENT = "presence:update";
const PRESENCE_ROOM = "deepiri-hub";

/**
 * Multi-user presence via platform realtime-gateway (not a frontend-only multiplayer stack).
 * Peers announce themselves; gateway fans out presence:update events.
 * Room / auth hardening belongs in deepiri-realtime-gateway.
 */
export function usePresence(enabled = true) {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const active = Boolean(enabled && token);
  const [peers, setPeers] = useState<PresencePeer[]>([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!active) {
      return () => {
        socketRef.current?.disconnect();
        socketRef.current = null;
      };
    }

    const selfId = user?.id || `anon-${Math.random().toString(36).slice(2, 9)}`;
    const selfName = user?.name || user?.email || "User";

    const socket = io(REALTIME_GATEWAY_URL, {
      transports: ["websocket"],
      reconnection: true,
      auth: { token },
      query: { room: PRESENCE_ROOM },
    });
    socketRef.current = socket;

    const announce = () => {
      socket.emit(PRESENCE_EVENT, {
        id: selfId,
        name: selfName,
        room: PRESENCE_ROOM,
        lastSeen: Date.now(),
      });
    };

    socket.on("connect", () => {
      setConnected(true);
      announce();
    });
    socket.on("disconnect", () => setConnected(false));

    socket.on(PRESENCE_EVENT, (data: Partial<PresencePeer> & { room?: string }) => {
      if (!data?.id || data.id === selfId) return;
      if (data.room && data.room !== PRESENCE_ROOM) return;
      setPeers((prev) => {
        const next = prev.filter((p) => p.id !== data.id);
        next.push({
          id: String(data.id),
          name: String(data.name || "User"),
          lastSeen: typeof data.lastSeen === "number" ? data.lastSeen : Date.now(),
        });
        return next.sort((a, b) => a.name.localeCompare(b.name));
      });
    });

    const heartbeat = window.setInterval(announce, 15_000);
    const prune = window.setInterval(() => {
      const cutoff = Date.now() - 45_000;
      setPeers((prev) => prev.filter((p) => p.lastSeen >= cutoff));
    }, 10_000);

    return () => {
      window.clearInterval(heartbeat);
      window.clearInterval(prune);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [active, token, user?.id, user?.name, user?.email]);

  return {
    peers: active ? peers : [],
    connected: active ? connected : false,
    peerCount: active ? peers.length : 0,
  };
}
