import { useEffect } from 'react';
import { useSceneStore } from '../store/sceneStore';
import { PORTAL_URL } from '../config/services';

/** Receive JWT from Portal via postMessage. */
export function useAuthMessage(): void {
  const setToken = useSceneStore((s) => s.setToken);

  useEffect(() => {
    const allowed = (() => {
      try {
        return new URL(PORTAL_URL).origin;
      } catch {
        return 'http://localhost:5173';
      }
    })();

    const onMessage = (ev: MessageEvent) => {
      if (ev.origin !== allowed && ev.origin !== 'http://127.0.0.1:5173') return;
      const data = ev.data as { type?: string; token?: string | null };
      if (data?.type === 'deepiri:auth') {
        setToken(data.token ?? null);
      }
    };
    window.addEventListener('message', onMessage);
    try {
      window.opener?.postMessage({ type: 'deepiri:immersive-ready' }, allowed);
    } catch {
      /* ignore */
    }
    return () => window.removeEventListener('message', onMessage);
  }, [setToken]);
}
