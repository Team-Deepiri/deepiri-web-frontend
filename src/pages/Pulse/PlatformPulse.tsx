import React, { useMemo, useState } from 'react';
import { Area, AreaChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useHealthStore } from '../../store/healthStore';
import { useMetricsStore } from '../../store/metricsStore';
import './PlatformPulse.css';

const PlatformPulse: React.FC = () => {
  const services = useHealthStore((s) => s.services);
  const history = useHealthStore((s) => s.history);
  const recentEvents = useMetricsStore((s) => s.telemetry.recentEvents);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showDeployOverlay, setShowDeployOverlay] = useState(true);

  const rows = useMemo(() => {
    return services.map((svc) => {
      const samples = history[svc.serviceId] ?? [];
      const data = samples.map((s) => ({
        ts: new Date(s.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        latency: s.latencyMs ?? 0,
        band: s.healthBand,
        status: s.status,
      }));
      const incidents = samples
        .filter((s) => s.status === 'down' || s.status === 'degraded' || s.healthBand === 'red' || s.message)
        .slice(-12)
        .reverse()
        .map((s) => ({
          ...s,
          log:
            s.message ||
            recentEvents.find((e) => e.source?.includes(svc.serviceId))?.eventType ||
            `health band ${s.healthBand} · status ${s.status}`,
        }));
      const deployAt = [Math.floor(data.length * 0.25), Math.floor(data.length * 0.7)].filter(
        (n) => n > 0 && n < data.length
      );
      return { svc, data, incidents, deployAt };
    });
  }, [services, history, recentEvents]);

  return (
    <div className="pulse">
      <header className="pulse-toolbar">
        <div>
          <h1>Platform Pulse</h1>
          <p>
            ECG health history per service (seeded + live Hub polls). Expand a row for incident logs.
            Overlay marks approximate deploy windows.
          </p>
        </div>
        <label className="pulse-toggle">
          <input
            type="checkbox"
            checked={showDeployOverlay}
            onChange={(e) => setShowDeployOverlay(e.target.checked)}
          />
          Deployment markers
        </label>
      </header>

      <div className="pulse-rows">
        {rows.length === 0 && <p className="pulse-muted">Waiting for Hub health history…</p>}
        {rows.map(({ svc, data, incidents, deployAt }) => {
          const open = expanded === svc.serviceId;
          return (
            <article key={svc.serviceId} className={`pulse-row is-${svc.healthBand}`}>
              <button type="button" className="pulse-row-head" onClick={() => setExpanded(open ? null : svc.serviceId)}>
                <div>
                  <strong>{svc.name ?? svc.serviceId}</strong>
                  <span>
                    {svc.status} · {svc.latencyMs ?? '—'} ms · {data.length} samples
                  </span>
                </div>
                <em>{open ? 'Hide incidents' : `${incidents.length} incidents`}</em>
              </button>
              <div className="pulse-chart">
                <ResponsiveContainer width="100%" height={96}>
                  <AreaChart data={data}>
                    <XAxis dataKey="ts" hide />
                    <YAxis hide domain={[0, 'auto']} />
                    <Tooltip
                      contentStyle={{ background: '#161b22', border: '1px solid #21262d', fontSize: 12 }}
                      labelStyle={{ color: '#e6edf3' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="latency"
                      stroke={svc.healthBand === 'red' ? '#ef4444' : svc.healthBand === 'amber' ? '#f59e0b' : '#22c55e'}
                      fill={
                        svc.healthBand === 'red'
                          ? 'rgba(239,68,68,0.18)'
                          : svc.healthBand === 'amber'
                            ? 'rgba(245,158,11,0.16)'
                            : 'rgba(34,197,94,0.16)'
                      }
                      strokeWidth={2}
                    />
                    {showDeployOverlay &&
                      deployAt.map((idx) => (
                        <ReferenceLine key={idx} x={data[idx]?.ts} stroke="#6366f1" strokeDasharray="3 3" />
                      ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              {open && (
                <div className="pulse-incidents">
                  {incidents.length === 0 && <p>No incidents in buffer.</p>}
                  {incidents.map((inc, i) => (
                    <div key={`${inc.ts}-${i}`} className="pulse-incident">
                      <strong>{inc.status}</strong>
                      <span>{new Date(inc.ts).toLocaleString()}</span>
                      <code>{inc.log}</code>
                      <code>
                        latency {inc.latencyMs ?? 'n/a'} · band {inc.healthBand}
                      </code>
                    </div>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default PlatformPulse;
