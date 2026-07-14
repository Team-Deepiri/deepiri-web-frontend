import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

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
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Platform Ops Hub</h1>
      <p className="text-gray-500 mb-6">Registry, jobs, truss, and telemetry at a glance.</p>
      {loading ? (
        <p>Checking services…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {services.map((s) => {
            const card = (
              <div className="border rounded-lg p-4 shadow-sm h-full">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{s.name}</span>
                  <span className={s.status === 'ok' ? 'text-green-600' : 'text-red-500'}>
                    {s.status}
                  </span>
                </div>
                <code className="text-xs text-gray-500">{s.path}</code>
              </div>
            );
            return s.link ? (
              <Link key={s.name} to={s.link} className="hover:shadow-md transition-shadow rounded-lg">
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
