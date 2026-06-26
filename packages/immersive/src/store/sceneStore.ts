import { create } from 'zustand'
import type { ServiceHealth, DeepiriEvent } from '@deepiri/shared'

interface SceneState {
  // Services from Hub Server
  services: ServiceHealth[]
  selectedServiceId: string | null
  // Events for particles
  recentEvents: DeepiriEvent[]
  // Scene controls
  particlesEnabled: boolean
  constellationMode: boolean
  filterCategories: string[]
  // Auth from Portal
  token: string | null
  // Actions
  setServices: (services: ServiceHealth[]) => void
  setSelectedService: (id: string | null) => void
  addEvent: (event: DeepiriEvent) => void
  setParticlesEnabled: (v: boolean) => void
  setConstellationMode: (v: boolean) => void
  toggleCategory: (cat: string) => void
  setToken: (token: string) => void
}

export const useSceneStore = create<SceneState>((set) => ({
  services: [],
  selectedServiceId: null,
  recentEvents: [],
  particlesEnabled: true,
  constellationMode: false,
  filterCategories: ['Platform', 'AI', 'Comms', 'Tooling', 'Experimental'],
  token: null,

  setServices: (services) => set({ services }),
  setSelectedService: (selectedServiceId) => set({ selectedServiceId }),
  addEvent: (event) =>
    set((s) => ({
      recentEvents: [event, ...s.recentEvents].slice(0, 200),
    })),
  setParticlesEnabled: (particlesEnabled) => set({ particlesEnabled }),
  setConstellationMode: (constellationMode) => set({ constellationMode }),
  toggleCategory: (cat) =>
    set((s) => ({
      filterCategories: s.filterCategories.includes(cat)
        ? s.filterCategories.filter((c) => c !== cat)
        : [...s.filterCategories, cat],
    })),
  setToken: (token) => set({ token }),
}))
