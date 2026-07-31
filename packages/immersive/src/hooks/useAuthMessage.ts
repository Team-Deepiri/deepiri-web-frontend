import { useEffect } from 'react';
import { useSceneStore } from '../store/sceneStore';

/** Receive JWT from Portal via postMessage. */
export function useAuthMessage(): void {
  const setToken = useSceneStore((s) => s.setToken);

  useEffect(() => {
    const onMessage = (ev: MessageEvent) => {
      const data = ev.data as { type?: string; token?: string | null };
      if (data?.type === 'deepiri:auth') {
        setToken(data.token ?? null);
      }
    };
    window.addEventListener('message', onMessage);
    // Announce ready so portal retries can succeed sooner
    try {
      window.opener?.postMessage({ type: 'deepiri:immersive-ready' }, '*');
    } catch {
      /* ignore */
    }
    return () => window.removeEventListener('message', onMessage);
  }, [setToken]);
}
