import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { hubClient, type HubRepo } from '../../services/hubClient';
import './Launchpad.css';

type DockerRepoStatus = {
  repoId: string;
  available: boolean;
  error?: string;
  services: Array<{ name: string; running: boolean; status: string }>;
};

type GhCommit = { sha: string; commit: { message: string; author?: { name?: string; date?: string } } };

const Launchpad: React.FC = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [cloneRepo, setCloneRepo] = useState<HubRepo | null>(null);
  const [cloneMode, setCloneMode] = useState<'https' | 'ssh'>('https');
  const [detail, setDetail] = useState<HubRepo | null>(null);
  const [copied, setCopied] = useState(false);
  const [readme, setReadme] = useState<string | null>(null);
  const [commits, setCommits] = useState<GhCommit[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const { data: registry, isLoading, isError, error, refetch, isFetching } = useQuery(
    ['hub', 'registry'],
    () => hubClient.getRegistry(),
    { staleTime: 30_000, retry: 1 }
  );

  const { data: docker } = useQuery(['hub', 'docker'], () => hubClient.getDockerStatus(), {
    staleTime: 20_000,
    retry: 1,
  });

  const dockerByRepo = useMemo(() => {
    const map = new Map<string, DockerRepoStatus>();
    for (const row of (docker?.repos ?? []) as DockerRepoStatus[]) {
      map.set(row.repoId, row);
    }
    return map;
  }, [docker]);

  const categories = useMemo(() => {
    const set = new Set((registry?.repos ?? []).map((r) => r.category || 'uncategorized'));
    return ['all', ...[...set].sort()];
  }, [registry]);

  const repos = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (registry?.repos ?? []).filter((r) => {
      if (category !== 'all' && (r.category || 'uncategorized') !== category) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        (r.description ?? '').toLowerCase().includes(q) ||
        (r.tags ?? []).some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [registry, query, category]);

  useEffect(() => {
    if (!detail?.httpsUrl) {
      setReadme(null);
      setCommits([]);
      return;
    }
    const match = detail.httpsUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return;
    const [, owner, rawRepo] = match;
    const repo = rawRepo.replace(/\.git$/, '');
    let cancelled = false;
    setDetailLoading(true);
    void (async () => {
      try {
        const [readmeRes, commitsRes] = await Promise.all([
          fetch(`https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`).catch(() => null),
          fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=5`).catch(() => null),
        ]);
        if (cancelled) return;
        if (readmeRes?.ok) {
          const text = await readmeRes.text();
          setReadme(text.slice(0, 2500));
        } else {
          setReadme(null);
        }
        if (commitsRes?.ok) {
          setCommits((await commitsRes.json()) as GhCommit[]);
        } else {
          setCommits([]);
        }
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [detail]);

  const cloneUrl = (repo: HubRepo) => {
    if (cloneMode === 'ssh') {
      return (
        repo.sshUrl ||
        (repo.httpsUrl ? `${repo.httpsUrl.replace('https://github.com/', 'git@github.com:')}.git` : '')
      );
    }
    return repo.httpsUrl || '';
  };

  const copyClone = async () => {
    if (!cloneRepo) return;
    await navigator.clipboard.writeText(cloneUrl(cloneRepo));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const vscodeUri = (repo: HubRepo) =>
    `vscode://vscode.git/clone?url=${encodeURIComponent(repo.httpsUrl || '')}`;

  const launch = (repo: HubRepo) => {
    const url = repo.launchUrl || (repo.nginxPath ? `http://localhost${repo.nginxPath}` : null);
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="launchpad">
      <header className="launchpad-toolbar">
        <div>
          <h1>Repo Launchpad</h1>
          <p>Clone, launch, inspect README/activity, and open graphs for every registered Deepiri repo.</p>
        </div>
        <div className="launchpad-controls">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search repos…"
            aria-label="Search repositories"
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button type="button" onClick={() => void refetch()} disabled={isFetching}>
            Refresh
          </button>
        </div>
      </header>

      {isLoading && <p className="launchpad-muted">Loading registry…</p>}
      {isError && (
        <p className="launchpad-error">{(error as Error)?.message || 'Hub registry unavailable'}</p>
      )}

      <div className="launchpad-grid">
        {repos.map((repo) => {
          const dock = dockerByRepo.get(repo.id);
          const running = dock?.services?.filter((s) => s.running).length ?? 0;
          const total = dock?.services?.length ?? 0;
          return (
            <article key={repo.id} className="launchpad-card">
              <div className="launchpad-card-top">
                <h2>{repo.name}</h2>
                <span className="launchpad-cat">{repo.category || 'repo'}</span>
              </div>
              <p>{repo.description || 'No description'}</p>
              <div className="launchpad-tags">
                {(repo.tags ?? []).map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              <div className="launchpad-docker">
                {dock?.available
                  ? `Docker: ${running}/${total} up`
                  : dock?.error
                    ? 'Docker: unavailable'
                    : 'Docker: —'}
                {repo.nginxPath ? ` · nginx ${repo.nginxPath}` : ''}
              </div>
              <div className="launchpad-actions">
                <button type="button" onClick={() => setCloneRepo(repo)}>
                  Clone
                </button>
                <button type="button" onClick={() => launch(repo)} disabled={!repo.launchUrl && !repo.nginxPath}>
                  Launch
                </button>
                <Link to={`/repos/${repo.id}/graph`}>Graph</Link>
                <button type="button" onClick={() => setDetail(repo)}>
                  Detail
                </button>
                {repo.httpsUrl && (
                  <a href={repo.httpsUrl} target="_blank" rel="noreferrer">
                    GitHub
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {cloneRepo && (
        <div className="launchpad-modal" role="dialog" aria-label="Clone repository">
          <div className="launchpad-modal-card">
            <h3>Clone {cloneRepo.name}</h3>
            <div className="launchpad-toggle">
              <button type="button" className={cloneMode === 'https' ? 'is-on' : ''} onClick={() => setCloneMode('https')}>
                HTTPS
              </button>
              <button type="button" className={cloneMode === 'ssh' ? 'is-on' : ''} onClick={() => setCloneMode('ssh')}>
                SSH
              </button>
            </div>
            <code className="launchpad-clone-url">{cloneUrl(cloneRepo)}</code>
            <div className="launchpad-modal-actions">
              <button type="button" onClick={() => void copyClone()}>
                {copied ? 'Copied' : 'Copy'}
              </button>
              <a href={vscodeUri(cloneRepo)}>Open in VS Code</a>
              <button type="button" onClick={() => setCloneRepo(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {detail && (
        <aside className="launchpad-detail">
          <button type="button" onClick={() => setDetail(null)}>
            Close
          </button>
          <h2>{detail.name}</h2>
          <p>{detail.description}</p>
          <dl>
            <div>
              <dt>Category</dt>
              <dd>{detail.category || '—'}</dd>
            </div>
            <div>
              <dt>Local path</dt>
              <dd>{detail.localPath || '—'}</dd>
            </div>
            <div>
              <dt>Launch</dt>
              <dd>{detail.launchUrl || detail.nginxPath || '—'}</dd>
            </div>
            <div>
              <dt>HTTPS</dt>
              <dd>{detail.httpsUrl || '—'}</dd>
            </div>
          </dl>

          <h3>Docker services</h3>
          <ul className="launchpad-svc-list">
            {(dockerByRepo.get(detail.id)?.services ?? []).map((s) => (
              <li key={s.name}>
                {s.name} · {s.running ? 'up' : s.status}
              </li>
            ))}
            {(dockerByRepo.get(detail.id)?.services ?? []).length === 0 && <li>No compose services reported</li>}
          </ul>

          <h3>Recent activity</h3>
          {detailLoading && <p className="launchpad-muted">Loading GitHub…</p>}
          <ul className="launchpad-svc-list">
            {commits.map((c) => (
              <li key={c.sha}>
                {c.commit.message.split('\n')[0]}
                <em>
                  {c.commit.author?.name} ·{' '}
                  {c.commit.author?.date ? new Date(c.commit.author.date).toLocaleDateString() : ''}
                </em>
              </li>
            ))}
            {!detailLoading && commits.length === 0 && <li>No public commit activity loaded</li>}
          </ul>

          <h3>README</h3>
          <pre className="launchpad-readme">{readme || 'README unavailable (private repo or missing main branch).'}</pre>

          <div className="launchpad-actions">
            <button type="button" onClick={() => launch(detail)} disabled={!detail.launchUrl && !detail.nginxPath}>
              Launch
            </button>
            <Link to={`/repos/${detail.id}/graph`}>Open community graph</Link>
          </div>
        </aside>
      )}
    </div>
  );
};

export default Launchpad;
