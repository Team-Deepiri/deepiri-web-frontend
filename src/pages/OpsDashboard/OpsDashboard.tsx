import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useHealthStore } from '../../store/healthStore';
import './OpsDashboard.css';

type Range = '1h' | '6h' | '24h' | '7d';

const RANGE_POINTS: Record<Range, number> = {
  '1h': 12,
  '6h': 24,
  '24h': 48,
  '7d': 84,
};

const OpsDashboard: React.FC = () => {
  const services = useHealthStore((s) => s.services);
  const history = useHealthStore((s) => s.history);
  const error = useHealthStore((s) => s.error);
  const lastFetched = useHealthStore((s) => s.lastFetched);
  const [range, setRange] = useState<Range>('1h');
  const [selected, setSelected] = useState<string | null>(null);

  const activeId = selected ?? services[0]?.serviceId ?? null;

  const series = useMemo(() => {
    if (!activeId) return [];
    const samples = (history[activeId] ?? []).slice(-RANGE_POINTS[range]);
    return samples.map((s, i) => ({
      i,
      ts: new Date(s.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      latency: s.latencyMs ?? 0,
      up: s.status === 'up' ? 1 : 0,
      error: s.status === 'down' || s.status === 'degraded' ? 1 : 0,
    }));
  }, [activeId, history, range]);

  const overview = useMemo(
    () =>
      services.map((s) => ({
        name: s.name ?? s.serviceId,
        latency: s.latencyMs ?? 0,
        status: s.status,
      })),
    [services]
  );

  return (
    <div className="ops-dash">
      <header className="ops-dash-toolbar">
        <div>
          <h1>Ops Dashboard</h1>
          <p>
            Live Hub health metrics · last fetch {lastFetched ? new Date(lastFetched).toLocaleTimeString() : '—'}
            {error ? ` · ${error}` : ''}
          </p>
        </div>
        <div className="ops-dash-controls">
          {(['1h', '6h', '24h', '7d'] as Range[]).map((r) => (
            <button key={r} type="button" className={range === r ? 'is-on' : ''} onClick={() => setRange(r)}>
              {r}
            </button>
          ))}
          <Link to="/ops/hub" className="ops-dash-link">
            Service Hub
          </Link>
          <Link to="/ops/jobs" className="ops-dash-link">
            Jobs
          </Link>
          <Link to="/ops/registry" className="ops-dash-link">
            Registry
          </Link>
          <Link to="/ops/truss" className="ops-dash-link">
            Truss
          </Link>
          <Link to="/ops/telemetry" className="ops-dash-link">
            Telemetry
          </Link>
        </div>
      </header>

      <div className="ops-dash-grid">
        <section className="ops-dash-panel ops-dash-span">
          <h2>Latency by service</h2>
          <div className="ops-dash-chart">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={overview}>
                <CartesianGrid stroke="#21262d" strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fill: '#8b949e', fontSize: 11 }} />
                <YAxis tick={{ fill: '#8b949e', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#161b22', border: '1px solid #21262d' }}
                  labelStyle={{ color: '#e6edf3' }}
                />
                <Bar dataKey="latency" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="ops-dash-panel">
          <h2>Services</h2>
          <ul className="ops-dash-services">
            {services.map((s) => (
              <li key={s.serviceId}>
                <button
                  type="button"
                  className={activeId === s.serviceId ? 'is-on' : ''}
                  onClick={() => setSelected(s.serviceId)}
                >
                  <span>{s.name ?? s.serviceId}</span>
                  <em className={`ops-dash-status is-${s.healthBand}`}>{s.status}</em>
                </button>
              </li>
            ))}
            {services.length === 0 && <li className="ops-dash-muted">Waiting for Hub health poll…</li>}
          </ul>
        </section>

        <section className="ops-dash-panel ops-dash-wide">
          <h2>{activeId ? `${activeId} · latency & availability` : 'Select a service'}</h2>
          <div className="ops-dash-chart">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={series}>
                <CartesianGrid stroke="#21262d" strokeDasharray="3 3" />
                <XAxis dataKey="ts" tick={{ fill: '#8b949e', fontSize: 11 }} />
                <YAxis tick={{ fill: '#8b949e', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#161b22', border: '1px solid #21262d' }}
                  labelStyle={{ color: '#e6edf3' }}
                />
                <Area type="monotone" dataKey="latency" stroke="#06b6d4" fill="rgba(6,182,212,0.2)" />
                <Area type="monotone" dataKey="error" stroke="#ef4444" fill="rgba(239,68,68,0.15)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
};

export default OpsDashboard;
