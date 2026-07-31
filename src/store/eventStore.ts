import { create } from 'zustand';
import type { DeepiriEvent, EventProducer } from '../types/hub';
import { hubWsUrl } from '../services/hubClient';

const PRODUCERS: EventProducer[] = [
  'synapse',
  'sugarGlider',
  'languageIntelligence',
  'redisStreams',
  'realtimeGateway',
];

const BUFFER_CAP = 100;

type EventState = {
  byProducer: Record<EventProducer, DeepiriEvent[]>;
  paused: boolean;
  connected: boolean;
  demoRunning: boolean;
  setPaused: (v: boolean) => void;
  push: (event: DeepiriEvent) => void;
  clear: () => void;
  connect: () => () => void;
  /** Force-push even when paused (detail inspection / demo). */
  pushForced: (event: DeepiriEvent) => void;
  startDemoStream: (intervalMs?: number) => () => void;
};

function emptyBuffers(): Record<EventProducer, DeepiriEvent[]> {
  return {
    synapse: [],
    sugarGlider: [],
    languageIntelligence: [],
    redisStreams: [],
    realtimeGateway: [],
  };
}

export const useEventStore = create<EventState>((set, get) => ({
  byProducer: emptyBuffers(),
  paused: false,
  connected: false,
  demoRunning: false,

  setPaused: (v) => set({ paused: v }),

  push: (event) => {
    if (get().paused) return;
    get().pushForced(event);
  },

  pushForced: (event) => {
    const producer = PRODUCERS.includes(event.producer) ? event.producer : 'realtimeGateway';
    set((s) => {
      const lane = [...s.byProducer[producer], event].slice(-BUFFER_CAP);
      return { byProducer: { ...s.byProducer, [producer]: lane } };
    });
  },

  clear: () => set({ byProducer: emptyBuffers() }),

  startDemoStream: (intervalMs = 1_200) => {
    set({ demoRunning: true });
    const types = ['message', 'task.updated', 'health.tick', 'inference', 'stream.batch'];
    const id = setInterval(() => {
      if (get().paused) return;
      const producer = PRODUCERS[Math.floor(Math.random() * PRODUCERS.length)];
      const isError = Math.random() < 0.08;
      get().pushForced({
        id: `demo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        producer,
        type: isError ? 'error' : types[Math.floor(Math.random() * types.length)],
        timestamp: new Date().toISOString(),
        error: isError,
        payload: { demo: true, latencyMs: Math.round(40 + Math.random() * 400) },
      });
    }, intervalMs);
    return () => {
      clearInterval(id);
      set({ demoRunning: false });
    };
  },

  connect: () => {
    let ws: WebSocket | null = null;
    let closed = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const open = () => {
      if (closed) return;
      try {
        ws = new WebSocket(hubWsUrl());
      } catch {
        set({ connected: false });
        retryTimer = setTimeout(open, 5_000);
        return;
      }

      ws.onopen = () => set({ connected: true });
      ws.onclose = () => {
        set({ connected: false });
        if (!closed) retryTimer = setTimeout(open, 5_000);
      };
      ws.onerror = () => {
        ws?.close();
      };
      ws.onmessage = (msg) => {
        try {
          const data = JSON.parse(String(msg.data)) as {
            type?: string;
            event?: DeepiriEvent;
            recent?: DeepiriEvent[];
          };
          if (data.type === 'hello' && Array.isArray(data.recent)) {
            for (const ev of data.recent) get().push(ev);
            return;
          }
          if (data.type === 'event' && data.event) {
            get().push(data.event);
          }
        } catch {
          /* ignore malformed */
        }
      };
    };

    open();

    return () => {
      closed = true;
      if (retryTimer) clearTimeout(retryTimer);
      ws?.close();
      set({ connected: false });
    };
  },
}));
