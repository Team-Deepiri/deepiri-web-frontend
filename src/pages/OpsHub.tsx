import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { RefreshCw } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import './OpsHub.css';

type ServiceCard = {
  name: string;
  path: string;
  status: string;
  link?: string;
};

// axiosInstance's baseURL already ends in /api, so these must NOT repeat
// the /api prefix -- otherwise every request doubles up to /api/api/... and
// never resolves, which is why these health checks always showed
// "unreachable" regardless of actual service health.
const OPS_ENDPOINTS: Array<{ name: string; path: string; link?: string }> = [
  { name: 'Registry', path: '/registry/services', link: '/ops/registry' },
  { name: 'Jobs', path: '/jobs', link: '/ops/jobs' },
  { name: 'Truss', path: '/truss/health', link: '/ops/truss' },
  { name: 'Telemetry', path: '/telemetry/health', link: '/ops/telemetry' },
];

const HUB_LINKS = [{ name: 'Repo Graph', path: 'Hub /graph/:repo', link: '/graph' }] as const;

async function checkServices(): Promise<ServiceCard[]> {
  return Promise.all(
    OPS_ENDPOINTS.map(async (ep) => {
      try {
        await axiosInstance.get(ep.path, { timeout: 5000 });
        return { name: ep.name, path: ep.path, status: 'ok', link: ep.link };
      } catch {
        return { name: ep.name, path: ep.path, status: 'unreachable', link: ep.link };
      }
    })
  );
}

// Matches JobsDashboard's cache window so hopping between /ops and /ops/jobs
// doesn't re-run every health check on each visit.
const OPS_STALE_TIME = 30 * 1000;

const OpsHub: React.FC = () => {
  const {
    data: services = [],
    isLoading: loading,
    isFetching,
    refetch,
  } = useQuery<ServiceCard[]>(['opsHub', 'services'], checkServices, { staleTime: OPS_STALE_TIME });

  return (
    <div className="ops-hub-container">
      <div className="ops-hub-header-row">
        <h1 className="ops-hub-title">Platform Ops Hub</h1>
        <button onClick={() => void refetch()} className="ops-hub-refresh-btn" disabled={isFetching}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>
      <p className="ops-hub-subtitle">Registry, jobs, truss, telemetry, and repo graphs.</p>
      {loading ? (
        <p className="ops-hub-subtitle">Checking services…</p>
      ) : (
        <div className="ops-hub-grid">
          {services.map((s) => {
            const card = (
              <div className="ops-card">
                <div className="ops-card-header">
                  <span className="ops-card-name">{s.name}</span>
                  <span className={s.status === 'ok' ? 'ops-card-status-ok' : 'ops-card-status-bad'}>
                    {s.status}
                  </span>
                </div>
                <code className="ops-card-path">{s.path}</code>
              </div>
            );
            return s.link ? (
              <Link key={s.name} to={s.link} className="ops-card-link">
                {card}
              </Link>
            ) : (
              <div key={s.name}>{card}</div>
            );
          })}
          {HUB_LINKS.map((item) => (
            <Link key={item.name} to={item.link} className="ops-card-link">
              <div className="ops-card">
                <div className="ops-card-header">
                  <span className="ops-card-name">{item.name}</span>
                  <span className="ops-card-status-ok">open</span>
                </div>
                <code className="ops-card-path">{item.path}</code>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default OpsHub;
