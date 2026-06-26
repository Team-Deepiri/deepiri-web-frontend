import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  sidebarCollapsed: boolean;
  cyrexOpen: boolean;
  immersiveLive: boolean;
  tourActive: boolean;
  tourStep: number;
  selectedServiceId: string | null;
  setSidebarCollapsed: (v: boolean) => void;
  setCyrexOpen: (v: boolean) => void;
  setImmersiveLive: (v: boolean) => void;
  setTourActive: (v: boolean) => void;
  setTourStep: (step: number) => void;
  setSelectedService: (id: string | null) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      cyrexOpen: true,
      immersiveLive: false,
      tourActive: false,
      tourStep: 0,
      selectedServiceId: null,
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      setCyrexOpen: (v) => set({ cyrexOpen: v }),
      setImmersiveLive: (v) => set({ immersiveLive: v }),
      setTourActive: (v) => set({ tourActive: v }),
      setTourStep: (tourStep) => set({ tourStep }),
      setSelectedService: (selectedServiceId) => set({ selectedServiceId }),
    }),
    {
      name: "deepiri-ui",
      partialize: (s) => ({
        sidebarCollapsed: s.sidebarCollapsed,
        cyrexOpen: s.cyrexOpen,
      }),
    }
  )
);
