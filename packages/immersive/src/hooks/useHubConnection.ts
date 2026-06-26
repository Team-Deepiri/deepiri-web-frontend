import { useEffect, useRef } from 'react'
import { useSceneStore } from '@/store/sceneStore'
import type { DeepiriEvent, ServiceHealth } from '@deepiri/shared'

const HUB_WS_URL = import.meta.env.VITE_HUB_WS_URL || 'ws://localhost:5200/ws'
const HUB_REST_URL = import.meta.env.VITE_HUB_SERVER_URL || 'http://localhost:5200'

export function useHubConnection() {
  const { setServices, addEvent } = useSceneStore()
  const wsRef = useRef<WebSocket | null>(null)

  // Poll health from Hub Server
  useEffect(() => {
    async function fetchHealth() {
      try {
        const res = await fetch(`${HUB_REST_URL}/health/all`)
        const data: ServiceHealth[] = await res.json()
        setServices(data)
      } catch {
        // Hub Server not reachable — keep last known state
      }
    }
    fetchHealth()
    const interval = setInterval(fetchHealth, 10_000)
    return () => clearInterval(interval)
  }, [setServices])

  // WebSocket for real-time events (particles)
  useEffect(() => {
    function connect() {
      const ws = new WebSocket(HUB_WS_URL)
      wsRef.current = ws

      ws.onmessage = (msg) => {
        try {
          const parsed = JSON.parse(msg.data)
          if (parsed.type === 'event') {
            addEvent(parsed.data as DeepiriEvent)
          }
        } catch { /* ignore */ }
      }

      ws.onclose = () => setTimeout(connect, 3000)
      ws.onerror = () => ws.close()
    }
    connect()
    return () => wsRef.current?.close()
  }, [addEvent])
}
