import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { githubApi, type GhOverview, type GhMemberActivity } from '../api/githubApi';
import { ROLES, rolesGrantableBy } from '../types/roles';
import type { DeepiriRole } from '../types/roles';
import { userApi } from '../api/userApi';
import { useAuth } from '../contexts/AuthContext';
import { roleFromUser } from '../utils/roles';
import { Users, Sparkles, Github, ExternalLink, GitPullRequest, Eye, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Person {
  _id?: string;
  id?: string;
  name?: string;
  username?: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
  metadata?: any;
  deepiriRole?: DeepiriRole;
  role?: DeepiriRole;
  specializedTitle?: string;
  githubUsername?: string;
}

const ROLE_ORDER: DeepiriRole[] = ['owner', 'leadership', 'admin', 'it', 'ai_ml', 'software_developer', 'qa_support'];

function roleRank(r?: string): number {
  const idx = ROLE_ORDER.indexOf(r as DeepiriRole);
  return idx === -1 ? 99 : idx;
}

function ghLogin(p: Person): string {
  return String(p.githubUsername || p.metadata?.githubUsername || '').trim();
}

function personId(p: Person): string {
  return String(p._id || p.id || '');
}

const chip = (bg: string): React.CSSProperties => ({ background: bg, fontSize: 11 });

const People: React.FC = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState<string | null>(null);

  // Role granting (from #162): who is looking, and what may they hand out.
  const { user, deepiriRole } = useAuth();
  const myId = String(user?._id || (user as any)?.id || '');
  const myRole = deepiriRole;
  const grantableRoles = rolesGrantableBy(myRole);
  const [savingRole, setSavingRole] = useState<string | null>(null);

  const [gh, setGh] = useState<GhOverview | null>(null);
  const [ghNotConfigured, setGhNotConfigured] = useState(false);
  const [ghError, setGhError] = useState<string | null>(null);
  const [ghLoading, setGhLoading] = useState(false);

  // Open-PR table filters
  const [prRepoFilter, setPrRepoFilter] = useState('all');
  const [prDevFilter, setPrDevFilter] = useState('all');
  const [prQaFilter, setPrQaFilter] = useState('all');

  const loadPeople = React.useCallback(async () => {
    setLoading(true);
    setUsersError(null);
    try {
      const res = await axiosInstance.get('/users').then(r => r.data);
      const data = res?.users || res?.data || res;
      const list: Person[] = Array.isArray(data) ? data : [];
      list.sort((a, b) => {
        const ra = (a.deepiriRole || a.role || a.metadata?.deepiriRole || '') as string;
        const rb = (b.deepiriRole || b.role || b.metadata?.deepiriRole || '') as string;
        return roleRank(ra) - roleRank(rb) || String(a.name || '').localeCompare(String(b.name || ''));
      });
      setPeople(list);

      list.forEach(p => {
        const uid = p._id || p.id || '';
        if (!uid) return;
        axiosInstance.get(`/users/${uid}/summary`).then(r => {
          const s = (r.data as any)?.summary || (r.data as any)?.data || '';
          if (s) setSummaries(prev => ({ ...prev, [uid]: String(s) }));
        }).catch(() => {});
      });
    } catch (err: any) {
      setPeople([]);
      setUsersError(
        err?.response?.status === 401
          ? 'Your session expired — sign in again to see the directory.'
          : err?.response?.data?.error || err?.message || 'Could not load the org directory.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPeople(); }, [loadPeople]);

  // Once we know who's here, pull the whole-team GitHub picture in one call.
  const loadGh = React.useCallback(async () => {
    if (people.length === 0) return;
    const logins = Array.from(new Set(people.map(ghLogin).filter(Boolean)));
    setGhLoading(true);
    setGhError(null);
    try {
      const res = await githubApi.getOverview(logins);
      setGh(res.overview);
      setGhNotConfigured(res.notConfigured);
      setGhError(res.error);
    } finally {
      setGhLoading(false);
    }
  }, [people]);

  useEffect(() => { loadGh(); }, [loadGh]);

  const activityFor = (login: string): GhMemberActivity | null =>
    (login && gh?.members?.[login.toLowerCase()]) || null;

  // GitHub logins that are active but not tied to a Deepiri account.
  const unlinked = useMemo(() => {
    if (!gh) return [];
    const known = new Set(people.map(p => ghLogin(p).toLowerCase()).filter(Boolean));
    return Object.values(gh.members)
      .filter(m => !known.has(m.login.toLowerCase()))
      .filter(m => m.openPrCount > 0 || m.reviewRequestedCount > 0)
      .sort((a, b) => (b.openPrCount + b.reviewRequestedCount) - (a.openPrCount + a.reviewRequestedCount));
  }, [gh, people]);

  // Open-PR table: filter option lists + the rows left after the 3 dropdowns.
  const prView = useMemo(() => {
    const pulls = gh?.pulls ?? [];
    const byName = (a: string, b: string) => a.toLowerCase().localeCompare(b.toLowerCase());
    const devsOf = (p: typeof pulls[number]) => [p.author.login, ...p.assignees];
    const qaOf = (p: typeof pulls[number]) => [...p.requestedReviewers, ...p.reviews.map(r => r.login)];

    const repoOpts = Array.from(new Set(pulls.map(p => p.repo))).sort(byName);
    const devOpts = Array.from(new Set(pulls.flatMap(devsOf))).sort(byName);
    const qaOpts = Array.from(new Set(pulls.flatMap(qaOf))).sort(byName);

    const eq = (v: string, list: string[]) => list.some(x => x.toLowerCase() === v.toLowerCase());
    const rows = pulls.filter(p =>
      (prRepoFilter === 'all' || p.repo === prRepoFilter) &&
      (prDevFilter === 'all' || eq(prDevFilter, devsOf(p))) &&
      (prQaFilter === 'all' || eq(prQaFilter, qaOf(p)))
    );
    return { repoOpts, devOpts, qaOpts, rows, total: pulls.length };
  }, [gh, prRepoFilter, prDevFilter, prQaFilter]);

  const prFiltered = prRepoFilter !== 'all' || prDevFilter !== 'all' || prQaFilter !== 'all';
  const clearPrFilters = () => { setPrRepoFilter('all'); setPrDevFilter('all'); setPrQaFilter('all'); };

  const generateTitle = async (p: Person) => {
    const uid = p._id || p.id || '';
    setGenerating(uid);
    try {
      const res = await axiosInstance.post('/integrations/openrouter/generate-title', { userId: uid, name: p.name, bio: p.bio }).then(r => r.data).catch(() => null);
      const title = res?.title || res?.data?.title || 'Deepiri Specialist — ' + (p.deepiriRole || 'Member');
      toast.success(`Generated: ${title}`);
      setPeople(prev => prev.map(x => (x._id || x.id) === uid ? { ...x, specializedTitle: title } : x));
    } catch {
      toast.error('OpenRouter proxy not configured — using local generation.');
      const fallback = `Deepiri Specialist — ${ROLES[(p.deepiriRole || 'software_developer') as DeepiriRole]?.label || 'Member'}`;
      setPeople(prev => prev.map(x => (x._id || x.id) === uid ? { ...x, specializedTitle: fallback } : x));
    } finally { setGenerating(null); }
  };

  if (loading) return <div className="min-vh-100 bg-gray-50 d-flex align-items-center justify-content-center"><div className="spinner-border text-primary" /></div>;

  const canAssignRoleFor = (p: Person): boolean => {
    if (grantableRoles.length === 0) return false;       // not owner/admin
    const uid = personId(p);
    if (!uid || uid === myId) return false;              // never your own role
    const targetRole = roleFromUser(p);
    if (targetRole === 'owner') return false;            // an owner is never reassigned in-app
    if (targetRole === 'admin' && myRole !== 'owner') return false; // only an owner touches an admin
    return true;
  };

  const changeRole = async (p: Person, nextRole: DeepiriRole) => {
    const uid = personId(p);
    const prevRole = roleFromUser(p);
    if (!uid || nextRole === prevRole) return;
    setSavingRole(uid);
    setPeople(prev => prev.map(x => personId(x) === uid ? { ...x, role: nextRole, deepiriRole: nextRole } : x));
    try {
      await userApi.setUserRole(uid, nextRole);
      toast.success(`${p.name || 'User'} is now ${ROLES[nextRole]?.label || nextRole}`);
    } catch (e: any) {
      setPeople(prev => prev.map(x => personId(x) === uid ? { ...x, role: prevRole || undefined, deepiriRole: prevRole || undefined } : x));
      toast.error(e?.error || e?.message || 'Could not change role — you may not have permission.');
    } finally { setSavingRole(null); }
  };

  return (
    <div className="min-vh-100 bg-gray-50">
      <div className="container px-3 py-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h1 className="h3 mb-1 d-flex align-items-center gap-2"><Users size={20} /> People</h1>
            <div className="small text-muted">Full org directory ordered by authority, with each member's live GitHub pull-request activity.</div>
          </div>
          <Link to="/profile" className="btn btn-outline-secondary btn-sm">Edit your profile</Link>
        </div>

        {/* Team GitHub summary */}
        {(gh || ghLoading) && (
          <div className="card-modern bg-white p-3 mb-3 d-flex flex-wrap align-items-center gap-3">
            <span className="d-inline-flex align-items-center gap-2 fw-semibold"><Github size={16} /> {gh?.org || 'GitHub'}</span>
            {gh ? (
              <>
                <span className="small text-muted"><strong>{gh.totals.openPrs}</strong> open PRs</span>
                <span className="small text-muted">across <strong>{gh.totals.repos}</strong> repos</span>
                <span className="small text-muted"><strong>{gh.totals.awaitingReview}</strong> awaiting review</span>
                <span className="small text-muted ms-auto d-inline-flex align-items-center gap-2">
                  {ghLoading && <span className="spinner-border spinner-border-sm" style={{ width: 12, height: 12 }} />}
                  updated {new Date(gh.generatedAt).toLocaleTimeString()}
                </span>
              </>
            ) : (
              <span className="small text-muted d-inline-flex align-items-center gap-2">
                <span className="spinner-border spinner-border-sm" style={{ width: 12, height: 12 }} /> loading team activity…
              </span>
            )}
          </div>
        )}
        {ghNotConfigured && (
          <div className="alert alert-warning py-2 px-3 small mb-3 d-flex align-items-center gap-2">
            <AlertTriangle size={14} /> GitHub App isn't configured on <code>external-bridge-service</code> yet — activity below will fill in once it is.
          </div>
        )}
        {ghError && !gh && (
          <div className="alert alert-danger py-2 px-3 small mb-3 d-flex align-items-center gap-2">
            <AlertTriangle size={14} /> Couldn't load GitHub activity: {ghError}
          </div>
        )}

        {usersError ? (
          <div className="card-modern bg-white p-5 text-center">
            <div className="text-danger fw-semibold mb-2 d-flex align-items-center justify-content-center gap-2"><AlertTriangle size={16} /> {usersError}</div>
            <button className="btn btn-sm btn-outline-primary" onClick={loadPeople}>Retry</button>
          </div>
        ) : people.length === 0 ? (
          <div className="card-modern bg-white p-5 text-center">
            <div className="small text-muted">No members in the directory yet. New accounts appear here after sign-up.</div>
          </div>
        ) : (
          <>
            <div className="small text-muted mb-2"><strong>{people.length}</strong> {people.length === 1 ? 'member' : 'members'}</div>
            <div className="border rounded-3 bg-white p-3" style={{ maxHeight: '70vh', overflowY: 'auto', overflowX: 'hidden' }}>
            <div className="row g-3">
            {people.map((p, i) => {
              const realId = p._id || p.id || '';
              // Stable key: a random fallback would remount the card every render.
              const uid = realId || ghLogin(p) || p.email || `row-${i}`;
              const role: DeepiriRole | null = (p.deepiriRole || p.role || p.metadata?.deepiriRole || null) as any;
              const meta = role ? ROLES[role] : null;
              const title = p.specializedTitle || p.metadata?.specializedTitle || '';
              const login = ghLogin(p);
              const act = activityFor(login);
              // Never invent a name: fall back to username, then the GitHub
              // handle, then a neutral placeholder.
              const displayName = (p.name || '').trim() || (p.username || '').trim() || (login ? `@${login}` : 'Unnamed member');
              const displayInitial = (displayName.replace(/^@/, '')[0] || '?').toUpperCase();
              const showRoleControl = canAssignRoleFor(p);
              return (
                <div key={String(uid)} className="col-md-6 col-lg-4">
                  <div className="card-modern bg-white p-4 h-100 d-flex flex-column gap-2" style={{ borderLeft: `3px solid ${meta?.color || '#e5e7eb'}` }}>
                    <div className="d-flex align-items-center gap-3">
                      {p.avatarUrl
                        ? <img src={p.avatarUrl} alt={displayName} className="flex-shrink-0" style={{ width: 44, height: 44, borderRadius: 999, objectFit: 'cover' }} />
                        : <div className="d-inline-flex align-items-center justify-content-center rounded-circle text-white fw-bold flex-shrink-0" style={{ width: 44, height: 44, background: meta?.color || '#6b7280' }}>{displayInitial}</div>}
                      <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <div className="fw-semibold text-dark text-truncate" title={displayName}>{displayName}</div>
                        <div className="small text-muted d-flex align-items-center gap-1" style={{ minWidth: 0 }}>
                          {meta ? <span className="px-2 py-1 rounded-pill text-white flex-shrink-0" style={chip(meta.color)}>{meta.shortLabel}</span> : <span className="small text-muted flex-shrink-0">Member</span>}
                          {title && <span className="text-truncate" title={title}>· {title}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="small text-muted text-break"><strong>Role (app role):</strong> {meta?.label || role || '—'}</div>
                    <div className="small text-break"><strong>Specialized Title (from Deepiri):</strong> {title || <span className="text-muted">—</span>}</div>
                    {p.bio && <div className="small text-muted text-break" style={{ lineHeight: 1.5 }}>{p.bio}</div>}
                    {summaries[String(p._id || p.id)] && <div className="small p-2 rounded-3 border bg-light text-break"><strong>Summary (OpenRouter):</strong> {summaries[String(p._id || p.id)]}</div>}

                    {showRoleControl && (
                      <div className="d-flex align-items-center gap-2 mt-1">
                        <label className="small fw-semibold text-muted mb-0">Set role</label>
                        <select
                          className="form-select form-select-sm"
                          style={{ maxWidth: 200 }}
                          value={role && grantableRoles.includes(role) ? role : ''}
                          disabled={savingRole === personId(p)}
                          onChange={(e) => { const v = e.target.value as DeepiriRole; if (v) changeRole(p, v); }}
                        >
                          <option value="" disabled>{role ? `${ROLES[role]?.label || role} (change…)` : 'Choose…'}</option>
                          {grantableRoles.map(r => (
                            <option key={r} value={r}>{ROLES[r]?.label || r}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="d-flex flex-wrap gap-2 mt-2">
                      <button className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 flex-shrink-0" onClick={() => generateTitle(p)} disabled={!realId || generating === realId}>
                        <Sparkles size={14} /> {generating === realId ? 'Generating…' : 'Generate Title'}
                      </button>
                      {login && (
                        <a href={`https://github.com/${login}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1" style={{ maxWidth: '100%' }} title={`@${login}`}>
                          <Github size={14} className="flex-shrink-0" />
                          <span className="text-truncate">@{login}</span>
                          <ExternalLink size={12} className="flex-shrink-0" />
                        </a>
                      )}
                    </div>

                    {/* GitHub activity */}
                    <div className="mt-2 border-top pt-2">
                      <div className="small fw-semibold mb-1 d-flex align-items-center gap-1"><Github size={13} /> GitHub activity</div>
                      {!login ? (
                        <div className="small text-muted">No GitHub linked — connect in Profile → Integrations.</div>
                      ) : ghLoading && !gh ? (
                        <div className="small text-muted">Loading activity…</div>
                      ) : !act || (act.openPrCount === 0 && act.reviewRequestedCount === 0 && !act.reviews30d) ? (
                        <div className="small text-muted">No open PRs or review requests right now.</div>
                      ) : (
                        <>
                          <div className="d-flex flex-wrap gap-1 mb-2">
                            <span className="badge rounded-pill text-bg-light border d-inline-flex align-items-center gap-1"><GitPullRequest size={11} /> {act.openPrCount} open PR{act.openPrCount === 1 ? '' : 's'}</span>
                            <span className="badge rounded-pill text-bg-light border d-inline-flex align-items-center gap-1"><Eye size={11} /> {act.reviewRequestedCount} review request{act.reviewRequestedCount === 1 ? '' : 's'}</span>
                            {act.reviews30d != null && <span className="badge rounded-pill text-bg-light border">{act.reviews30d} reviews · 30d</span>}
                          </div>
                          {act.openPrs.slice(0, 5).map(pr => (
                            <div key={`${pr.repo}#${pr.number}`} className="small d-flex justify-content-between align-items-baseline gap-2 border-top py-1">
                              <a href={pr.url} target="_blank" rel="noreferrer" className="text-decoration-none text-truncate flex-grow-1" style={{ minWidth: 0 }} title={pr.title}>
                                {pr.draft && <span className="badge text-bg-secondary me-1" style={{ fontSize: 9 }}>draft</span>}
                                {pr.title}
                              </a>
                              <span className="text-muted flex-shrink-0 text-nowrap">{pr.repo} #{pr.number}</span>
                            </div>
                          ))}
                          {act.reviewRequested.slice(0, 3).map(pr => (
                            <div key={`rr-${pr.repo}#${pr.number}`} className="small d-flex justify-content-between align-items-baseline gap-2 border-top py-1">
                              <a href={pr.url} target="_blank" rel="noreferrer" className="text-decoration-none text-truncate flex-grow-1" style={{ minWidth: 0 }} title={pr.title}>
                                <Eye size={10} className="me-1 text-muted" />reviewing {pr.title}
                              </a>
                              <span className="text-muted flex-shrink-0 text-nowrap">{pr.repo} · @{pr.author}</span>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
            </div>
          </>
        )}

        {/* PRs by repo — who's on what, and who's reviewing. Always shown once
            the directory is up; the body swaps between loading / empty / table. */}
        {!usersError && people.length > 0 && (
          <div className="card-modern bg-white p-4 mt-3">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
              <h2 className="h5 mb-0 d-flex align-items-center gap-2"><GitPullRequest size={16} /> Open pull requests — dev &amp; review coverage</h2>
              {gh && gh.pulls.length > 0 && (
                <span className="small text-muted">
                  showing <strong>{prView.rows.length}</strong> of {prView.total}
                  {prFiltered && <button className="btn btn-link btn-sm p-0 ms-2 align-baseline" onClick={clearPrFilters}>clear filters</button>}
                </span>
              )}
            </div>

            {ghLoading && !gh ? (
              <div className="d-flex align-items-center justify-content-center gap-2 small text-muted py-5 border rounded-3">
                <span className="spinner-border spinner-border-sm" /> Loading open pull requests…
              </div>
            ) : ghNotConfigured ? (
              <div className="small text-muted py-4 text-center border rounded-3">
                GitHub App isn't configured on <code>external-bridge-service</code> — no pull-request data yet.
              </div>
            ) : ghError && !gh ? (
              <div className="small py-4 text-center border rounded-3 d-flex flex-column align-items-center gap-2">
                <span className="text-danger"><AlertTriangle size={14} className="me-1" />Couldn't load pull requests: {ghError}</span>
                <button className="btn btn-sm btn-outline-primary" onClick={loadGh}>Retry</button>
              </div>
            ) : !gh || gh.pulls.length === 0 ? (
              <div className="small text-muted py-4 text-center border rounded-3">No open pull requests across the tracked repos.</div>
            ) : (
            <>
            <div className="row g-2 mb-2">
              <div className="col-sm-4">
                <label className="form-label small text-muted mb-1">Repo</label>
                <select className="form-select form-select-sm" value={prRepoFilter} onChange={e => setPrRepoFilter(e.target.value)}>
                  <option value="all">All repos ({prView.repoOpts.length})</option>
                  {prView.repoOpts.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="col-sm-4">
                <label className="form-label small text-muted mb-1">Dev</label>
                <select className="form-select form-select-sm" value={prDevFilter} onChange={e => setPrDevFilter(e.target.value)}>
                  <option value="all">All devs ({prView.devOpts.length})</option>
                  {prView.devOpts.map(d => <option key={d} value={d}>@{d}</option>)}
                </select>
              </div>
              <div className="col-sm-4">
                <label className="form-label small text-muted mb-1">QA / review</label>
                <select className="form-select form-select-sm" value={prQaFilter} onChange={e => setPrQaFilter(e.target.value)}>
                  <option value="all">All reviewers ({prView.qaOpts.length})</option>
                  {prView.qaOpts.map(q => <option key={q} value={q}>@{q}</option>)}
                </select>
              </div>
            </div>

            {prView.rows.length === 0 ? (
              <div className="small text-muted py-3 text-center border rounded-3">No open PRs match these filters.</div>
            ) : (
              <div style={{ maxHeight: 440, overflowY: 'auto', overflowX: 'auto' }} className="border rounded-3">
                <table className="table table-sm table-hover align-middle mb-0">
                  <thead>
                    <tr className="small text-muted" style={{ position: 'sticky', top: 0, zIndex: 1, background: '#fff', boxShadow: 'inset 0 -1px 0 #dee2e6' }}>
                      <th className="ps-3">PR</th><th>Repo</th><th>Dev</th><th className="pe-3">QA / review</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prView.rows.map(pr => {
                      const reviewers = Array.from(new Set([...pr.requestedReviewers, ...pr.reviews.map(r => r.login)]));
                      return (
                        <tr key={`${pr.repo}#${pr.number}`}>
                          <td className="small ps-3">
                            <a href={pr.url} target="_blank" rel="noreferrer" className="text-decoration-none">
                              {pr.draft && <span className="badge text-bg-secondary me-1" style={{ fontSize: 9 }}>draft</span>}
                              {pr.title}
                            </a>
                            <span className="text-muted"> #{pr.number}</span>
                          </td>
                          <td className="small">
                            <button className="btn btn-link btn-sm p-0 align-baseline text-decoration-none" onClick={() => setPrRepoFilter(pr.repo)} title={`Filter to ${pr.repo}`}>{pr.repo}</button>
                          </td>
                          <td className="small">
                            <button className="btn btn-link btn-sm p-0 align-baseline text-decoration-none" onClick={() => setPrDevFilter(pr.author.login)}>@{pr.author.login}</button>
                            {pr.assignees.filter(a => a !== pr.author.login).map(a => (
                              <button key={a} className="btn btn-link btn-sm p-0 ms-1 align-baseline text-decoration-none text-muted" onClick={() => setPrDevFilter(a)}>· @{a}</button>
                            ))}
                          </td>
                          <td className="small pe-3">
                            {reviewers.length === 0 ? <span className="text-muted">—</span> : reviewers.map(r => {
                              const rv = pr.reviews.find(x => x.login.toLowerCase() === r.toLowerCase());
                              const done = rv && rv.state !== 'PENDING' && rv.state !== 'COMMENTED';
                              return (
                                <button key={r} className={`btn btn-sm rounded-pill me-1 py-0 border-0 ${done ? 'text-bg-success' : 'text-bg-light border'}`} style={{ fontSize: 11 }} onClick={() => setPrQaFilter(r)}>
                                  @{r}{rv ? ` · ${rv.state.toLowerCase().replace('_', ' ')}` : ''}
                                </button>
                              );
                            })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            </>
            )}
          </div>
        )}

        {/* Active GitHub contributors with no Deepiri account linked */}
        {unlinked.length > 0 && (
          <div className="card-modern bg-white p-4 mt-3">
            <h2 className="h6 mb-2 d-flex align-items-center gap-2"><Github size={15} /> Unlinked GitHub contributors</h2>
            <div className="small text-muted mb-2">Active in org PRs but not matched to a Deepiri account — ask them to set their GitHub username in Profile → Integrations.</div>
            <div className="d-flex flex-wrap gap-2">
              {unlinked.map(m => (
                <a key={m.login} href={`https://github.com/${m.login}`} target="_blank" rel="noreferrer" className="badge rounded-pill text-bg-light border text-decoration-none">
                  @{m.login} · {m.openPrCount} PR{m.openPrCount === 1 ? '' : 's'}{m.reviewRequestedCount ? ` · ${m.reviewRequestedCount} review` : ''}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default People;
