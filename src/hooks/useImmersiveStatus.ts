import { useEffect, useState } from 'react';
import { hubClient } from '../services/hubClient';

export type ImmersiveLiveState = {
  live: boolean;
  loading: boolean;
  lastChecked: string | null;
};

/** Polls Hub Server for Immersive availability (Enter 3D button gate). */
export function useImmersiveStatus(intervalMs = 30_000): ImmersiveLiveState {
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      try {
        const res = await hubClient.getImmersiveStatus();
        if (cancelled) return;
        setLive(res.status === 'live');
        setLastChecked(res.lastChecked);
      } catch {
        if (cancelled) return;
        setLive(false);
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
  }, [intervalMs]);

  return { live, loading, lastChecked };
}
