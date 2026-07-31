import { create } from 'zustand';

type UiState = {
  sidebarCollapsed: boolean;
  cyrexOpen: boolean;
  tourActive: boolean;
  selectedNode: string | null;
  immersiveLive: boolean;
  mobileNavOpen: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  toggleSidebar: () => void;
  setCyrexOpen: (v: boolean) => void;
  toggleCyrex: () => void;
  setTourActive: (v: boolean) => void;
  setSelectedNode: (id: string | null) => void;
  setImmersiveLive: (v: boolean) => void;
  setMobileNavOpen: (v: boolean) => void;
};

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: localStorage.getItem('hub.sidebarCollapsed') === '1',
  cyrexOpen: localStorage.getItem('hub.cyrexOpen') !== '0',
  tourActive: false,
  selectedNode: null,
  immersiveLive: false,
  mobileNavOpen: false,
  setSidebarCollapsed: (v) => {
    localStorage.setItem('hub.sidebarCollapsed', v ? '1' : '0');
    set({ sidebarCollapsed: v });
  },
  toggleSidebar: () =>
    set((s) => {
      const next = !s.sidebarCollapsed;
      localStorage.setItem('hub.sidebarCollapsed', next ? '1' : '0');
      return { sidebarCollapsed: next };
    }),
  setCyrexOpen: (v) => {
    localStorage.setItem('hub.cyrexOpen', v ? '1' : '0');
    set({ cyrexOpen: v });
  },
  toggleCyrex: () =>
    set((s) => {
      const next = !s.cyrexOpen;
      localStorage.setItem('hub.cyrexOpen', next ? '1' : '0');
      return { cyrexOpen: next };
    }),
  setTourActive: (v) => set({ tourActive: v }),
  setSelectedNode: (id) => set({ selectedNode: id }),
  setImmersiveLive: (v) => set({ immersiveLive: v }),
  setMobileNavOpen: (v) => set({ mobileNavOpen: v }),
}));
