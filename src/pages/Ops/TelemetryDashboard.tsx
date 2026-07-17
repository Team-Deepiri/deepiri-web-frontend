import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { getEcosystemHealth, getJobMetrics, getRecentEvents } from '../../services/telemetryService';
import './TelemetryDashboard.css';

type Tab = 'ecosystem' | 'jobs' | 'events';

const TABS: Array<{ key: Tab; label: string }> = [
  { key: 'ecosystem', label: 'Ecosystem Health' },
  { key: 'jobs', label: 'Job Metrics' },
  { key: 'events', label: 'Recent Events' },
];

// Matches the other Ops dashboards' cache window so switching tabs / hopping
// back from /ops doesn't re-poll every check each time.
const TELEMETRY_STALE_TIME = 30 * 1000;

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'healthy':
    case 'ok':
      return 'telemetry-status-healthy';
    case 'unhealthy':
    case 'down':
      return 'telemetry-status-unhealthy';
    default:
      return 'telemetry-status-unknown';
  }
}

const TelemetryDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('ecosystem');

  const {
    data: ecosystem,
    isLoading: ecosystemLoading,
    isError: ecosystemErrored,
  } = useQuery(['telemetry', 'ecosystem'], getEcosystemHealth, {
    staleTime: TELEMETRY_STALE_TIME,
    enabled: tab === 'ecosystem',
  });

  const {
    data: jobMetrics,
    isLoading: jobMetricsLoading,
    isError: jobMetricsErrored,
  } = useQuery(['telemetry', 'jobs'], getJobMetrics, {
    staleTime: TELEMETRY_STALE_TIME,
    enabled: tab === 'jobs',
  });

  const {
    data: events = [],
    isLoading: eventsLoading,
    isError: eventsErrored,
  } = useQuery(['telemetry', 'events'], () => getRecentEvents(50), {
    staleTime: TELEMETRY_STALE_TIME,
    enabled: tab === 'events',
  });

  const refreshAll = () => {
    void queryClient.invalidateQueries(['telemetry']);
  };

  return (
    <div className="telemetry-dashboard-container">
      <Link to="/ops" className="telemetry-back-link">
        <ArrowLeft size={14} /> Ops Hub
      </Link>

      <div className="telemetry-header-row">
        <h1 className="telemetry-title">Telemetry</h1>
        <button onClick={refreshAll} className="telemetry-refresh-btn">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>
      <p className="telemetry-subtitle">Ecosystem health, job metrics, and recent platform events.</p>

      <div className="telemetry-tabs-row">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`telemetry-tab-btn ${tab === t.key ? 'active' : ''}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'ecosystem' &&
        (ecosystemLoading ? (
          <p className="telemetry-muted-text">Loading ecosystem health…</p>
        ) : ecosystemErrored || !ecosystem ? (
          <p className="telemetry-error-text">Could not reach the telemetry service.</p>
        ) : (
          <>
            {ecosystem.status === 'degraded' && (
              <div className="telemetry-degraded-banner">
                Degraded: {ecosystem.error ?? 'ecosystem health source unavailable'}
              </div>
            )}
            {ecosystem.registry && (
              <>
                <div className="telemetry-section-heading">Repos</div>
                <div className="telemetry-list">
                  {ecosystem.registry.repos.map((repo) => (
                    <div key={repo.id} className="telemetry-list-row">
                      <div className="telemetry-row-main">
                        <div className="telemetry-row-name">{repo.name}</div>
                      </div>
                      <span className={`telemetry-status-badge ${statusBadgeClass(repo.status)}`}>
                        {repo.status}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="telemetry-section-heading">Services</div>
                {ecosystem.registry.services.length === 0 ? (
                  <p className="telemetry-muted-text">No services have registered themselves yet.</p>
                ) : (
                  <div className="telemetry-list">
                    {ecosystem.registry.services.map((svc) => (
                      <div key={svc.name} className="telemetry-list-row">
                        <div className="telemetry-row-main">
                          <div className="telemetry-row-name">{svc.name}</div>
                        </div>
                        <span className={`telemetry-status-badge ${statusBadgeClass(svc.status)}`}>
                          {svc.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        ))}

      {tab === 'jobs' &&
        (jobMetricsLoading ? (
          <p className="telemetry-muted-text">Loading job metrics…</p>
        ) : jobMetricsErrored || !jobMetrics ? (
          <p className="telemetry-error-text">Could not reach the telemetry service.</p>
        ) : jobMetrics.status === 'degraded' ? (
          <div className="telemetry-degraded-banner">
            Degraded: {jobMetrics.error ?? 'jobs metrics source unavailable'}
          </div>
        ) : (
          <div className="telemetry-stats-grid">
            {Object.entries(jobMetrics.stats ?? {}).map(([status, count]) => (
              <div key={status} className="telemetry-stat-card">
                <div className="telemetry-stat-label">{status}</div>
                <div className="telemetry-stat-value">{count}</div>
              </div>
            ))}
          </div>
        ))}

      {tab === 'events' &&
        (eventsLoading ? (
          <p className="telemetry-muted-text">Loading recent events…</p>
        ) : eventsErrored ? (
          <p className="telemetry-error-text">Could not reach the telemetry service.</p>
        ) : events.length === 0 ? (
          <p className="telemetry-muted-text">No events recorded yet since the service last started.</p>
        ) : (
          <div className="telemetry-list">
            {events.map((event, i) => (
              <div key={i} className="telemetry-list-row">
                <div className="telemetry-row-main">
                  <div className="telemetry-row-name">{event.source}</div>
                  {event.data !== undefined && (
                    <div className="telemetry-row-desc">{JSON.stringify(event.data)}</div>
                  )}
                </div>
                <span className="telemetry-event-type">{event.eventType}</span>
                <span className="telemetry-event-timestamp">{event.timestamp}</span>
              </div>
            ))}
          </div>
        ))}
    </div>
  );
};

export default TelemetryDashboard;
