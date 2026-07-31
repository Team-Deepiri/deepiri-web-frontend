import React from 'react';
import { Link } from 'react-router-dom';
import { useHealthStore } from '../store/healthStore';

/** Compact Hub health strip for Dashboard — also a tour spotlight target. */
const HubHealthStrip: React.FC = () => {
  const services = useHealthStore((s) => s.services);
  const immersiveStatus = useHealthStore((s) => s.immersiveStatus);
  const error = useHealthStore((s) => s.error);
  const loading = useHealthStore((s) => s.loading);

  const up = services.filter((s) => s.status === 'up').length;
  const bad = services.filter((s) => s.status === 'down' || s.status === 'degraded');

  return (
    <section className="hub-health-strip" data-tour-id="tour-home-health" aria-label="Platform service health">
      <div className="hub-health-strip-head">
        <strong>Platform health</strong>
        <span>
          {loading && !services.length
            ? 'Loading…'
            : error
              ? `Hub issue — ${error}`
              : `${up}/${services.length} up · Immersive ${immersiveStatus}`}
        </span>
      </div>
      <div className="hub-health-strip-grid">
        {(services.length ? services : [{ serviceId: 'hub', name: 'Hub', status: error ? 'down' : 'unknown', healthBand: error ? 'red' : 'amber' }]).map(
          (s) => (
            <div key={s.serviceId} className={`hub-health-pill band-${s.healthBand}`}>
              <span>{s.name ?? s.serviceId}</span>
              <em>{s.status}</em>
            </div>
          )
        )}
      </div>
      <div className="hub-health-strip-links">
        <Link to="/ops">Ops</Link>
        <Link to="/pulse">Pulse</Link>
        <Link to="/events-river">Event River</Link>
        {bad.length > 0 && <span className="hub-health-bad">{bad.length} need attention</span>}
      </div>
    </section>
  );
};

export default HubHealthStrip;
