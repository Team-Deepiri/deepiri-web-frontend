import { useEffect } from 'react'
import { useSceneStore } from '@/store/sceneStore'

export function usePortalAuth() {
  const setToken = useSceneStore((s) => s.setToken)

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      // Only accept messages from Portal origin
      if (event.origin !== (import.meta.env.VITE_PORTAL_URL || 'http://localhost:5173')) return
      if (event.data?.type === 'DEEPIRI_AUTH' && event.data?.token) {
        setToken(event.data.token)
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [setToken])
}
