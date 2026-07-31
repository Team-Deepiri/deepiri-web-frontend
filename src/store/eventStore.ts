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
  setPaused: (v: boolean) => void;
  push: (event: DeepiriEvent) => void;
  clear: () => void;
  connect: () => () => void;
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

  setPaused: (v) => set({ paused: v }),

  push: (event) => {
    if (get().paused) return;
    const producer = PRODUCERS.includes(event.producer) ? event.producer : 'realtimeGateway';
    set((s) => {
      const lane = [...s.byProducer[producer], event].slice(-BUFFER_CAP);
      return { byProducer: { ...s.byProducer, [producer]: lane } };
    });
  },

  clear: () => set({ byProducer: emptyBuffers() }),

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
