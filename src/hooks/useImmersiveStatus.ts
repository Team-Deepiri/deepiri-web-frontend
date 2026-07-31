import { useEffect, useState } from 'react';
import { hubClient } from '../services/hubClient';
import { useUiStore } from '../store/uiStore';

export type ImmersiveLiveState = {
  live: boolean;
  loading: boolean;
  lastChecked: string | null;
};

/**
 * Polls Hub Server GET /health/immersive every 30s and mirrors into uiStore.immersiveLive
 * (Enter 3D button gate — Phase 3).
 */
export function useImmersiveStatus(intervalMs = 30_000): ImmersiveLiveState {
  const setImmersiveLive = useUiStore((s) => s.setImmersiveLive);
  const live = useUiStore((s) => s.immersiveLive);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      try {
        const res = await hubClient.getImmersiveStatus();
        if (cancelled) return;
        setImmersiveLive(res.status === 'live');
        setLastChecked(res.lastChecked);
      } catch {
        if (cancelled) return;
        setImmersiveLive(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void tick();
    const id = setInterval(() => void tick(), intervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [intervalMs, setImmersiveLive]);

  return { live, loading, lastChecked };
}
