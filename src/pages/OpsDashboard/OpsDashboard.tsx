import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useHealthStore } from '../../store/healthStore';
import { useMetricsStore } from '../../store/metricsStore';
import './OpsDashboard.css';

type Range = '1h' | '6h' | '24h' | '7d';
type Panel = 'requestRate' | 'errorRate' | 'p95Latency' | 'memoryMb';

const RANGE_POINTS: Record<Range, number> = {
  '1h': 20,
  '6h': 40,
  '24h': 70,
  '7d': 100,
};

const PANEL_META: Record<Panel, { title: string; color: string; unit: string }> = {
  requestRate: { title: 'Request rate', color: '#6366f1', unit: 'req/min' },
  errorRate: { title: 'Error rate', color: '#ef4444', unit: '%' },
  p95Latency: { title: 'p95 latency', color: '#06b6d4', unit: 'ms' },
  memoryMb: { title: 'Memory', color: '#a78bfa', unit: 'MB' },
};

const OpsDashboard: React.FC = () => {
  const services = useHealthStore((s) => s.services);
  const error = useHealthStore((s) => s.error);
  const lastFetched = useHealthStore((s) => s.lastFetched);
  const series = useMetricsStore((s) => s.series);
  const telemetry = useMetricsStore((s) => s.telemetry);
  const refreshTelemetry = useMetricsStore((s) => s.refreshTelemetry);

  const [range, setRange] = useState<Range>('1h');
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    void refreshTelemetry();
  }, [refreshTelemetry]);

  const activeId = selected ?? services[0]?.serviceId ?? null;
  const points = useMemo(() => {
    if (!activeId) return [];
    return (series[activeId] ?? []).slice(-RANGE_POINTS[range]);
  }, [activeId, series, range]);

  const overview = useMemo(() => {
    return services.map((s) => {
      const last = series[s.serviceId]?.at(-1);
      return {
        name: (s.name ?? s.serviceId).replace(/-service$/, ''),
        requestRate: last?.requestRate ?? 0,
        errorRate: last?.errorRate ?? 0,
        p95: last?.p95Latency ?? s.latencyMs ?? 0,
        memory: last?.memoryMb ?? 0,
      };
    });
  }, [services, series]);

  const jobBars = useMemo(
    () =>
      Object.entries(telemetry.jobStats).map(([k, v]) => ({
        name: k,
        value: v,
      })),
    [telemetry.jobStats]
  );

  return (
    <div className="ops-dash">
      <header className="ops-dash-toolbar">
        <div>
          <h1>Ops Dashboard</h1>
          <p>
            Request rate · error rate · p95 · memory per service
            {lastFetched ? ` · Hub ${new Date(lastFetched).toLocaleTimeString()}` : ''}
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

      <div className="ops-dash-panels">
        {(Object.keys(PANEL_META) as Panel[]).map((key) => (
          <section key={key} className="ops-dash-panel">
            <h2>
              {PANEL_META[key].title}
              <span>{PANEL_META[key].unit}</span>
            </h2>
            <div className="ops-dash-chart">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={overview}>
                  <CartesianGrid stroke="#21262d" strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fill: '#8b949e', fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={50} />
                  <YAxis tick={{ fill: '#8b949e', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #21262d' }} />
                  <Bar
                    dataKey={
                      key === 'requestRate'
                        ? 'requestRate'
                        : key === 'errorRate'
                          ? 'errorRate'
                          : key === 'p95Latency'
                            ? 'p95'
                            : 'memory'
                    }
                    fill={PANEL_META[key].color}
                    radius={[5, 5, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        ))}
      </div>

      <div className="ops-dash-grid">
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

        <section className="ops-dash-panel ops-dash-wide-inline">
          <h2>{activeId ? `${activeId} · time series (${range})` : 'Select a service'}</h2>
          <div className="ops-dash-chart">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={points}>
                <CartesianGrid stroke="#21262d" strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fill: '#8b949e', fontSize: 10 }} />
                <YAxis tick={{ fill: '#8b949e', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #21262d' }} />
                <Legend />
                <Line type="monotone" dataKey="requestRate" stroke="#6366f1" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="errorRate" stroke="#ef4444" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="p95Latency" stroke="#06b6d4" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="memoryMb" stroke="#a78bfa" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {(jobBars.length > 0 || telemetry.recentEvents.length > 0) && (
        <div className="ops-dash-grid ops-dash-telemetry">
          {jobBars.length > 0 && (
            <section className="ops-dash-panel">
              <h2>Jobs metrics (telemetry)</h2>
              <div className="ops-dash-chart">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={jobBars}>
                    <CartesianGrid stroke="#21262d" strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fill: '#8b949e', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#8b949e', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #21262d' }} />
                    <Bar dataKey="value" fill="#22c55e" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}
          {telemetry.recentEvents.length > 0 && (
            <section className="ops-dash-panel">
              <h2>Recent telemetry events</h2>
              <ul className="ops-dash-events">
                {telemetry.recentEvents.slice(0, 12).map((ev, i) => (
                  <li key={`${ev.timestamp}-${i}`}>
                    <strong>{ev.eventType}</strong>
                    <span>
                      {ev.source} · {new Date(ev.timestamp).toLocaleTimeString()}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default OpsDashboard;
