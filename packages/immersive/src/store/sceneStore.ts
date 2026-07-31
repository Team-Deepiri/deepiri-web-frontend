import { create } from 'zustand';
import type { EventProducer } from '@deepiri/shared/types';
import { IMMERSIVE_SERVICES, type ServiceCategory } from '../config/services';

export type HealthBand = 'green' | 'amber' | 'red';

export type NodeState = {
  id: string;
  position: [number, number, number];
  healthBand: HealthBand;
  status: string;
  latencyMs: number | null;
  connections: number;
};

export type ImmersiveEvent = {
  id: string;
  producer: EventProducer;
  type: string;
  error?: boolean;
  fromId: string;
  toId: string;
  bornAt: number;
};

type SceneState = {
  nodes: Record<string, NodeState>;
  selectedNode: string | null;
  cameraTarget: [number, number, number] | null;
  filters: Record<ServiceCategory, boolean>;
  particlesEnabled: boolean;
  constellationMode: boolean;
  reducedMotion: boolean;
  webglOk: boolean;
  token: string | null;
  hubConnected: boolean;
  traffic: Record<string, number>;
  pendingEvents: ImmersiveEvent[];
  hoveredNode: string | null;
  targetFps: 30 | 60;
  quality: 'high' | 'medium' | 'low';
  setSelectedNode: (id: string | null) => void;
  setCameraTarget: (t: [number, number, number] | null) => void;
  setFilter: (cat: ServiceCategory, on: boolean) => void;
  setParticlesEnabled: (v: boolean) => void;
  setConstellationMode: (v: boolean) => void;
  setReducedMotion: (v: boolean) => void;
  setWebglOk: (v: boolean) => void;
  setToken: (t: string | null) => void;
  setHubConnected: (v: boolean) => void;
  setHoveredNode: (id: string | null) => void;
  setTargetFps: (fps: 30 | 60) => void;
  setQuality: (q: 'high' | 'medium' | 'low') => void;
  updateHealth: (services: Array<{ serviceId: string; healthBand?: string; status?: string; latencyMs?: number | null }>) => void;
  setNodePosition: (id: string, pos: [number, number, number]) => void;
  bumpTraffic: (a: string, b: string, amount?: number) => void;
  pushEvent: (ev: ImmersiveEvent) => void;
  consumeEvents: () => ImmersiveEvent[];
  initNodes: () => void;
};

function band(v?: string): HealthBand {
  if (v === 'amber' || v === 'red' || v === 'green') return v;
  return 'red';
}

export const useSceneStore = create<SceneState>((set, get) => ({
  nodes: {},
  selectedNode: null,
  cameraTarget: null,
  filters: { platform: true, ai: true, comms: true, infra: true, tooling: true },
  particlesEnabled: true,
  constellationMode: true,
  reducedMotion: false,
  webglOk: true,
  token: null,
  hubConnected: false,
  traffic: {},
  pendingEvents: [],
  hoveredNode: null,
  targetFps: 60,
  quality: 'high',

  initNodes: () => {
    const nodes: Record<string, NodeState> = {};
    const degree = new Map<string, number>();
    // filled by App with edges — default 1
    for (const s of IMMERSIVE_SERVICES) {
      degree.set(s.id, 1);
    }
    set({
      nodes: Object.fromEntries(
        IMMERSIVE_SERVICES.map((s, i) => {
          const angle = (i / IMMERSIVE_SERVICES.length) * Math.PI * 2;
          return [
            s.id,
            {
              id: s.id,
              position: [Math.cos(angle) * 6, Math.sin(angle * 0.7) * 2, Math.sin(angle) * 6] as [
                number,
                number,
                number,
              ],
              healthBand: 'green' as HealthBand,
              status: 'unknown',
              latencyMs: null,
              connections: degree.get(s.id) ?? 1,
            },
          ];
        })
      ),
    });
  },

  setSelectedNode: (id) => set({ selectedNode: id }),
  setCameraTarget: (t) => set({ cameraTarget: t }),
  setFilter: (cat, on) => set((s) => ({ filters: { ...s.filters, [cat]: on } })),
  setParticlesEnabled: (v) => set({ particlesEnabled: v }),
  setConstellationMode: (v) => set({ constellationMode: v }),
  setReducedMotion: (v) => set({ reducedMotion: v }),
  setWebglOk: (v) => set({ webglOk: v }),
  setToken: (t) => set({ token: t }),
  setHubConnected: (v) => set({ hubConnected: v }),
  setHoveredNode: (id) => set({ hoveredNode: id }),
  setTargetFps: (fps) => set({ targetFps: fps }),
  setQuality: (q) => set({ quality: q }),

  updateHealth: (services) => {
    set((s) => {
      const nodes = { ...s.nodes };
      for (const svc of services) {
        const n = nodes[svc.serviceId];
        if (!n) continue;
        nodes[svc.serviceId] = {
          ...n,
          healthBand: band(svc.healthBand),
          status: svc.status ?? n.status,
          latencyMs: svc.latencyMs ?? n.latencyMs,
        };
      }
      return { nodes };
    });
  },

  setNodePosition: (id, pos) => {
    set((s) => {
      const n = s.nodes[id];
      if (!n) return s;
      return { nodes: { ...s.nodes, [id]: { ...n, position: pos } } };
    });
  },

  bumpTraffic: (a, b, amount = 1) => {
    const key = [a, b].sort().join('::');
    set((s) => ({ traffic: { ...s.traffic, [key]: (s.traffic[key] ?? 0) + amount } }));
  },

  pushEvent: (ev) => {
    set((s) => ({ pendingEvents: [...s.pendingEvents.slice(-80), ev] }));
    get().bumpTraffic(ev.fromId, ev.toId, ev.error ? 3 : 1);
  },

  consumeEvents: () => {
    const evs = get().pendingEvents;
    set({ pendingEvents: [] });
    return evs;
  },
}));
