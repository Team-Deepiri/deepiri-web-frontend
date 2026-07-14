import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
  { name: 'Registry', path: '/registry/services' },
  { name: 'Jobs', path: '/jobs', link: '/ops/jobs' },
  { name: 'Truss', path: '/truss/health' },
  { name: 'Telemetry', path: '/telemetry/health' },
];

const OpsHub: React.FC = () => {
  const [services, setServices] = useState<ServiceCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const results: ServiceCard[] = [];
      for (const ep of OPS_ENDPOINTS) {
        try {
          await axiosInstance.get(ep.path, { timeout: 5000 });
          results.push({ name: ep.name, path: ep.path, status: 'ok', link: ep.link });
        } catch {
          results.push({ name: ep.name, path: ep.path, status: 'unreachable', link: ep.link });
        }
      }
      setServices(results);
      setLoading(false);
    };
    void load();
  }, []);

  return (
    <div className="ops-hub-container">
      <h1 className="ops-hub-title">Platform Ops Hub</h1>
      <p className="ops-hub-subtitle">Registry, jobs, truss, and telemetry at a glance.</p>
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
        </div>
      )}
    </div>
  );
};

export default OpsHub;
