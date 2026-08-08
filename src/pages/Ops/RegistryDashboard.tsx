import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { listRepos, listTools, getEcosystemHealth } from '../../services/registryService';
import { OPS_DASHBOARD_STALE_TIME } from '../../constants/query';
import { statusBadgeClass as opsStatusBadgeClass } from '../../utils/ui';
import './RegistryDashboard.css';

type Tab = 'repos' | 'tools' | 'ecosystem';

const TABS: Array<{ key: Tab; label: string }> = [
  { key: 'repos', label: 'Repos' },
  { key: 'tools', label: 'Tools' },
  { key: 'ecosystem', label: 'Ecosystem Health' },
];

const REGISTRY_STALE_TIME = OPS_DASHBOARD_STALE_TIME;

function statusBadgeClass(status: string): string {
  return opsStatusBadgeClass(status, 'registry');
}

const RegistryDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('repos');

  const {
    data: repos = [],
    isLoading: reposLoading,
    isFetching: reposFetching,
    isError: reposErrored,
  } = useQuery(['registry', 'repos'], listRepos, { staleTime: REGISTRY_STALE_TIME, enabled: tab === 'repos' });

  const {
    data: tools = [],
    isLoading: toolsLoading,
    isFetching: toolsFetching,
    isError: toolsErrored,
  } = useQuery(['registry', 'tools'], listTools, { staleTime: REGISTRY_STALE_TIME, enabled: tab === 'tools' });

  const {
    data: ecosystem,
    isLoading: ecosystemLoading,
    isFetching: ecosystemFetching,
    isError: ecosystemErrored,
  } = useQuery(['registry', 'ecosystem'], getEcosystemHealth, {
    staleTime: REGISTRY_STALE_TIME,
    enabled: tab === 'ecosystem',
  });

  const refreshAll = () => {
    void queryClient.invalidateQueries(['registry']);
  };
  const refreshing = reposFetching || toolsFetching || ecosystemFetching;

  return (
    <div className="registry-dashboard-container">
      <Link to="/ops" className="registry-back-link">
        <ArrowLeft size={14} /> Ops Hub
      </Link>

      <div className="registry-header-row">
        <h1 className="registry-title">Registry</h1>
        <button onClick={refreshAll} className="registry-refresh-btn" disabled={refreshing}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>
      <p className="registry-subtitle">Service catalog, tools, and ecosystem health across the org.</p>

      <div className="registry-tabs-row">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`registry-tab-btn ${tab === t.key ? 'active' : ''}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'repos' &&
        (reposLoading ? (
          <p className="registry-muted-text">Loading repos…</p>
        ) : reposErrored ? (
          <p className="registry-error-text">Could not load repositories from the registry service.</p>
        ) : repos.length === 0 ? (
          <p className="registry-muted-text">No repos in the catalog yet.</p>
        ) : (
          <div className="registry-list">
            {repos.map((repo) => (
              <div key={repo.id} className="registry-list-row">
                <div className="registry-row-main">
                  {repo.githubUrl ? (
                    <a
                      href={repo.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="registry-row-name registry-row-link"
                    >
                      {repo.name}
                    </a>
                  ) : (
                    <div className="registry-row-name">{repo.name}</div>
                  )}
                  {repo.description && <div className="registry-row-desc">{repo.description}</div>}
                </div>
                <span className="registry-tier-badge">tier {repo.tier}</span>
              </div>
            ))}
          </div>
        ))}

      {tab === 'tools' &&
        (toolsLoading ? (
          <p className="registry-muted-text">Loading tools…</p>
        ) : toolsErrored ? (
          <p className="registry-error-text">Could not load tools from the registry service.</p>
        ) : tools.length === 0 ? (
          <p className="registry-muted-text">No tools registered yet.</p>
        ) : (
          <div className="registry-list">
            {tools.map((tool) => (
              <div key={tool.id} className="registry-list-row">
                <div className="registry-row-main">
                  <div className="registry-row-name">{tool.name}</div>
                  {tool.description && <div className="registry-row-desc">{tool.description}</div>}
                </div>
                <span className="registry-tool-kind">{tool.kind}</span>
              </div>
            ))}
          </div>
        ))}

      {tab === 'ecosystem' &&
        (ecosystemLoading ? (
          <p className="registry-muted-text">Loading ecosystem health…</p>
        ) : ecosystemErrored || !ecosystem ? (
          <p className="registry-error-text">Could not load ecosystem health from the registry service.</p>
        ) : (
          <>
            <div className="registry-section-heading">Repos</div>
            <div className="registry-list">
              {ecosystem.repos.map((repo) => (
                <div key={repo.id} className="registry-list-row">
                  <div className="registry-row-main">
                    <div className="registry-row-name">{repo.name}</div>
                  </div>
                  <span className={`registry-status-badge ${statusBadgeClass(repo.status)}`}>{repo.status}</span>
                </div>
              ))}
            </div>

            <div className="registry-section-heading">Services</div>
            {ecosystem.services.length === 0 ? (
              <p className="registry-muted-text">No services have registered themselves yet.</p>
            ) : (
              <div className="registry-list">
                {ecosystem.services.map((svc) => (
                  <div key={svc.name} className="registry-list-row">
                    <div className="registry-row-main">
                      <div className="registry-row-name">{svc.name}</div>
                    </div>
                    <span className={`registry-status-badge ${statusBadgeClass(svc.status)}`}>{svc.status}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        ))}
    </div>
  );
};

export default RegistryDashboard;
