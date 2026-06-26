import { useSceneStore } from '@/store/sceneStore'

const CATEGORIES = ['Platform', 'AI', 'Comms', 'Tooling', 'Experimental']

const PORTAL_URL = import.meta.env.VITE_PORTAL_URL || 'http://localhost:5173'

export function SceneControls() {
  const {
    particlesEnabled, setParticlesEnabled,
    constellationMode, setConstellationMode,
    filterCategories, toggleCategory,
  } = useSceneStore()

  return (
    <>
      {/* Back to Portal — fixed top left */}
      <div style={{ position: 'fixed', top: 16, left: 16, zIndex: 100 }}>
        <a
          href={PORTAL_URL}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 14px', borderRadius: 8,
            background: 'rgba(13,17,23,0.85)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#e6edf3', fontSize: 12, fontWeight: 600,
            textDecoration: 'none', letterSpacing: '0.04em',
          }}
        >
          ← Portal
        </a>
      </div>

      {/* Scene controls — fixed top right */}
      <div style={{
        position: 'fixed', top: 16, right: 16, zIndex: 100,
        display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end',
      }}>
        {/* Title */}
        <div style={{
          padding: '6px 14px', borderRadius: 8,
          background: 'rgba(13,17,23,0.85)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(99,102,241,0.3)',
          color: '#818cf8', fontSize: 13, fontWeight: 700, letterSpacing: '0.06em',
          fontFamily: 'sans-serif',
        }}>
          ✦ Deepiri Universe
        </div>

        {/* Controls panel */}
        <div style={{
          padding: '14px', borderRadius: 10,
          background: 'rgba(13,17,23,0.85)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', flexDirection: 'column', gap: 10, minWidth: 180,
        }}>
          {/* Particles toggle */}
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <span style={{ color: '#7d8590', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Particles</span>
            <input
              type="checkbox"
              checked={particlesEnabled}
              onChange={(e) => setParticlesEnabled(e.target.checked)}
              style={{ accentColor: '#6366f1' }}
            />
          </label>

          {/* Constellation mode */}
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <span style={{ color: '#7d8590', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Gravity Mode</span>
            <input
              type="checkbox"
              checked={constellationMode}
              onChange={(e) => setConstellationMode(e.target.checked)}
              style={{ accentColor: '#6366f1' }}
            />
          </label>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

          {/* Category filters */}
          <div style={{ color: '#7d8590', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>
            Show Categories
          </div>
          {CATEGORIES.map((cat) => (
            <label key={cat} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <span style={{ color: '#e6edf3', fontSize: 11 }}>{cat}</span>
              <input
                type="checkbox"
                checked={filterCategories.includes(cat)}
                onChange={() => toggleCategory(cat)}
                style={{ accentColor: '#6366f1' }}
              />
            </label>
          ))}
        </div>

        {/* Legend */}
        <div style={{
          padding: '10px 14px', borderRadius: 10,
          background: 'rgba(13,17,23,0.85)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          {[
            { color: '#22c55e', label: 'Healthy' },
            { color: '#f59e0b', label: 'Degraded' },
            { color: '#ef4444', label: 'Down' },
            { color: '#94a3b8', label: 'Unknown' },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
              <span style={{ color: '#7d8590', fontSize: 11 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
