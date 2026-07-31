import { useEffect } from 'react';
import { useSceneStore } from '../store/sceneStore';
import { HUB_URL, IMMERSIVE_EDGES, IMMERSIVE_SERVICES, CATEGORY_ORIGIN } from '../config/services';
import type { EventProducer } from '@deepiri/shared/types';

const PRODUCERS: EventProducer[] = [
  'synapse',
  'sugarGlider',
  'languageIntelligence',
  'redisStreams',
  'realtimeGateway',
];

function producerToNode(p: string): string {
  const s = p.toLowerCase();
  if (s.includes('sugar')) return 'sugar-glider';
  if (s.includes('language')) return 'language-intelligence';
  if (s.includes('synapse')) return 'synapse';
  if (s.includes('redis')) return 'redis';
  return 'realtime-gateway';
}

function randomPeer(from: string): string {
  const edges = IMMERSIVE_EDGES.filter(([a, b]) => a === from || b === from);
  if (edges.length === 0) {
    const ids = IMMERSIVE_SERVICES.map((s) => s.id).filter((id) => id !== from);
    return ids[Math.floor(Math.random() * ids.length)] ?? 'api-gateway';
  }
  const e = edges[Math.floor(Math.random() * edges.length)];
  return e[0] === from ? e[1] : e[0];
}

/** Seed positions by category cluster + wire Hub health/events. */
export function useHubData(): void {
  const initNodes = useSceneStore((s) => s.initNodes);
  const updateHealth = useSceneStore((s) => s.updateHealth);
  const setHubConnected = useSceneStore((s) => s.setHubConnected);
  const setNodePosition = useSceneStore((s) => s.setNodePosition);
  const pushEvent = useSceneStore((s) => s.pushEvent);

  useEffect(() => {
    initNodes();
    // Place by category with jitter
    const counts: Record<string, number> = {};
    for (const svc of IMMERSIVE_SERVICES) {
      const n = counts[svc.category] ?? 0;
      counts[svc.category] = n + 1;
      const origin = CATEGORY_ORIGIN[svc.category];
      const a = n * 0.9;
      setNodePosition(svc.id, [
        origin[0] + Math.cos(a) * 2.2,
        origin[1] + Math.sin(a * 1.3) * 1.4,
        origin[2] + Math.sin(a) * 2.2,
      ]);
    }

    // Connection counts
    const deg = new Map<string, number>();
    for (const [a, b] of IMMERSIVE_EDGES) {
      deg.set(a, (deg.get(a) ?? 0) + 1);
      deg.set(b, (deg.get(b) ?? 0) + 1);
    }
    for (const [id, c] of deg) {
      const node = useSceneStore.getState().nodes[id];
      if (node) {
        useSceneStore.setState({
          nodes: {
            ...useSceneStore.getState().nodes,
            [id]: { ...node, connections: c },
          },
        });
      }
    }
  }, [initNodes, setNodePosition]);

  useEffect(() => {
    let closed = false;
    let timer: ReturnType<typeof setInterval> | null = null;
    let ws: WebSocket | null = null;
    let retry: ReturnType<typeof setTimeout> | null = null;

    const pollHealth = async () => {
      try {
        const res = await fetch(`${HUB_URL}/health/all`);
        if (!res.ok) return;
        const data = (await res.json()) as {
          services?: Array<{ serviceId: string; healthBand?: string; status?: string; latencyMs?: number | null }>;
        };
        updateHealth(data.services ?? []);
      } catch {
        /* hub optional during boot */
      }
    };

    const connectWs = () => {
      if (closed) return;
      try {
        const u = new URL(HUB_URL);
        u.protocol = u.protocol === 'https:' ? 'wss:' : 'ws:';
        u.pathname = '/ws/events';
        ws = new WebSocket(u.toString());
      } catch {
        setHubConnected(false);
        retry = setTimeout(connectWs, 4000);
        return;
      }
      ws.onopen = () => setHubConnected(true);
      ws.onclose = () => {
        setHubConnected(false);
        if (!closed) retry = setTimeout(connectWs, 4000);
      };
      ws.onmessage = (msg) => {
        try {
          const data = JSON.parse(String(msg.data)) as {
            type?: string;
            event?: { id?: string; producer?: string; type?: string; error?: boolean };
          };
          if (data.type !== 'event' || !data.event) return;
          const producer = (PRODUCERS.includes(data.event.producer as EventProducer)
            ? data.event.producer
            : 'realtimeGateway') as EventProducer;
          const fromId = producerToNode(producer);
          const toId = randomPeer(fromId);
          pushEvent({
            id: data.event.id ?? `${Date.now()}`,
            producer,
            type: data.event.type ?? 'event',
            error: Boolean(data.event.error),
            fromId,
            toId,
            bornAt: performance.now(),
          });
        } catch {
          /* ignore */
        }
      };
    };

    void pollHealth();
    timer = setInterval(() => void pollHealth(), 10_000);
    connectWs();

    // Lightweight demo particles if hub is quiet
    const demo = setInterval(() => {
      if (useSceneStore.getState().pendingEvents.length > 8) return;
      const from = IMMERSIVE_SERVICES[Math.floor(Math.random() * IMMERSIVE_SERVICES.length)].id;
      const to = randomPeer(from);
      const producer = PRODUCERS[Math.floor(Math.random() * PRODUCERS.length)];
      const error = Math.random() < 0.08;
      pushEvent({
        id: `demo-${Date.now()}`,
        producer,
        type: error ? 'error' : 'pulse',
        error,
        fromId: from,
        toId: to,
        bornAt: performance.now(),
      });
    }, 1600);

    return () => {
      closed = true;
      if (timer) clearInterval(timer);
      if (retry) clearTimeout(retry);
      clearInterval(demo);
      ws?.close();
    };
  }, [updateHealth, setHubConnected, pushEvent]);
}
