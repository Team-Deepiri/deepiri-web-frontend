import { create } from "zustand";
import type { ServiceHealth } from "@deepiri/shared";

interface HealthState {
  services: ServiceHealth[];
  lastUpdated: number | null;
  isLoading: boolean;
  setServices: (services: ServiceHealth[]) => void;
  setLoading: (loading: boolean) => void;
  getById: (id: string) => ServiceHealth | undefined;
}

export const useHealthStore = create<HealthState>((set, get) => ({
  services: [],
  lastUpdated: null,
  isLoading: false,
  setServices: (services) => set({ services, lastUpdated: Date.now() }),
  setLoading: (isLoading) => set({ isLoading }),
  getById: (id) => get().services.find((s) => s.serviceId === id),
}));
