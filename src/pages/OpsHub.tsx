import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

type ServiceCard = {
  name: string;
  path: string;
  status: string;
};

const OPS_ENDPOINTS = [
  { name: 'Registry', path: '/api/registry/services' },
  { name: 'Jobs', path: '/api/jobs' },
  { name: 'Truss', path: '/api/truss/health' },
  { name: 'Telemetry', path: '/api/telemetry/health' },
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
          results.push({ name: ep.name, path: ep.path, status: 'ok' });
        } catch {
          results.push({ name: ep.name, path: ep.path, status: 'unreachable' });
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
          {services.map((s) => (
            <div key={s.name} className="border rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="font-semibold">{s.name}</span>
                <span className={s.status === 'ok' ? 'text-green-600' : 'text-red-500'}>
                  {s.status}
                </span>
              </div>
              <code className="text-xs text-gray-500">{s.path}</code>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OpsHub;
