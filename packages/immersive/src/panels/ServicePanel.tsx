import { useSceneStore } from '@/store/sceneStore'
import { STATUS_COLORS } from '@deepiri/shared'

const PORTAL_URL = import.meta.env.VITE_PORTAL_URL || 'http://localhost:5173'

export function ServicePanel() {
  const { services, selectedServiceId, setSelectedService } = useSceneStore()

  if (!selectedServiceId) return null

  const svc = services.find((s) => s.serviceId === selectedServiceId)
  if (!svc) return null

  const color = STATUS_COLORS[svc.status] || STATUS_COLORS.unknown

  return (
    <div style={{
      position: 'fixed', right: 24, top: '50%', transform: 'translateY(-50%)',
      zIndex: 200, width: 280,
      background: 'rgba(13,17,23,0.95)', backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderLeft: `3px solid ${color}`,
      borderRadius: 14, padding: '20px',
    }}>
      {/* Close */}
      <button
        onClick={() => setSelectedService(null)}
        style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: '#7d8590', fontSize: 16, cursor: 'pointer' }}
      >
        ✕
      </button>

      {/* Status dot + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0, boxShadow: `0 0 8px ${color}` }} />
        <div style={{ fontWeight: 700, fontSize: 15, color: '#e6edf3', fontFamily: 'sans-serif' }}>{svc.name}</div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { label: 'Status', value: svc.status },
          { label: 'Port', value: svc.port ? `:${svc.port}` : 'N/A' },
          { label: 'Uptime', value: svc.uptime ? `${Math.round(svc.uptime / 60)}m` : 'N/A' },
          { label: 'Response', value: svc.responseTime ? `${svc.responseTime}ms` : 'N/A' },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#7d8590', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</span>
            <span style={{ fontSize: 12, color: '#e6edf3', fontFamily: 'monospace' }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Link back to Portal service detail */}
      <a
        href={`${PORTAL_URL}/ops?service=${svc.serviceId}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'block', marginTop: 16, padding: '8px 0',
          textAlign: 'center', borderRadius: 8,
          border: '1px solid rgba(99,102,241,0.3)',
          background: 'rgba(99,102,241,0.08)',
          color: '#818cf8', fontSize: 11, fontWeight: 600,
          textDecoration: 'none', letterSpacing: '0.06em',
        }}
      >
        View in Portal →
      </a>
    </div>
  )
}
