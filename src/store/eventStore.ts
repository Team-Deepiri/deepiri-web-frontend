import { create } from "zustand";
import type { DeepiriEvent, EventProducer } from "@deepiri/shared";

const MAX_EVENTS_PER_PRODUCER = 100;

type EventBuffer = Record<EventProducer, DeepiriEvent[]>;

const emptyBuffer = (): EventBuffer => ({
  synapse: [],
  sugarGlider: [],
  languageIntelligence: [],
  redisStreams: [],
  realtimeGateway: [],
});

interface EventState {
  buffer: EventBuffer;
  totalReceived: number;
  addEvent: (event: DeepiriEvent) => void;
  clearProducer: (producer: EventProducer) => void;
  clearAll: () => void;
}

export const useEventStore = create<EventState>((set) => ({
  buffer: emptyBuffer(),
  totalReceived: 0,
  addEvent: (event) =>
    set((state) => {
      const lane = [...state.buffer[event.producer], event];
      if (lane.length > MAX_EVENTS_PER_PRODUCER) lane.shift();
      return {
        buffer: { ...state.buffer, [event.producer]: lane },
        totalReceived: state.totalReceived + 1,
      };
    }),
  clearProducer: (producer) =>
    set((state) => ({ buffer: { ...state.buffer, [producer]: [] } })),
  clearAll: () => set({ buffer: emptyBuffer(), totalReceived: 0 }),
}));
