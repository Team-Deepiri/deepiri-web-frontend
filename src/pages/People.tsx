import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { userApi } from '../api/userApi';
import { useAuth } from '../contexts/AuthContext';
import { roleFromUser } from '../utils/roles';
import { ROLES, rolesGrantableBy } from '../types/roles';
import type { DeepiriRole } from '../types/roles';
import { Users, Sparkles, Github, ExternalLink, ShieldCheck } from 'lucide-react';
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

function personId(p: Person): string {
  return String(p._id || p.id || '');
}

const People: React.FC = () => {
  const { user, deepiriRole } = useAuth();
  const myId = String(user?._id || (user as any)?.id || '');
  const myRole = deepiriRole;
  const grantableRoles = rolesGrantableBy(myRole);

  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState<Record<string, any[]>>({});
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState<string | null>(null);
  const [savingRole, setSavingRole] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        let list: Person[] = [];
        try {
          const res = await userApi.listUsers();
          const data = (res?.users || res?.data || res) as Person[] | undefined;
          if (Array.isArray(data)) list = data;
        } catch {
          toast.error('Could not load the directory');
        }
        // sort by authority
        list.sort((a, b) => roleRank(roleFromUser(a) || '') - roleRank(roleFromUser(b) || ''));
        setPeople(list);
        // lazy fetch activity/summaries best-effort
        list.forEach(p => {
          const uid = personId(p);
          if (!uid) return;
          axiosInstance.get(`/users/${uid}/activity`).then(r => {
            const d = (r.data as any)?.activity || (r.data as any)?.data || [];
            if (Array.isArray(d)) setActivity(prev => ({ ...prev, [uid]: d.slice(0, 3) }));
          }).catch(() => {});
          axiosInstance.get(`/users/${uid}/summary`).then(r => {
            const s = (r.data as any)?.summary || (r.data as any)?.data || '';
            if (s) setSummaries(prev => ({ ...prev, [uid]: String(s) }));
          }).catch(() => {});
        });
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const generateTitle = async (p: Person) => {
    const uid = personId(p);
    setGenerating(uid);
    try {
      const res = await axiosInstance.post('/integrations/openrouter/generate-title', { userId: uid, name: p.name, bio: p.bio }).then(r => r.data).catch(() => null);
      const title = res?.title || res?.data?.title || 'Deepiri Specialist — ' + (roleFromUser(p) || 'Member');
      toast.success(`Generated: ${title}`);
      setPeople(prev => prev.map(x => personId(x) === uid ? { ...x, specializedTitle: title } : x));
    } catch {
      toast.error('OpenRouter proxy not configured — using local generation.');
      const fallback = `Deepiri Specialist — ${ROLES[(roleFromUser(p) || 'software_developer') as DeepiriRole]?.label || 'Member'}`;
      setPeople(prev => prev.map(x => personId(x) === uid ? { ...x, specializedTitle: fallback } : x));
    } finally { setGenerating(null); }
  };

  // Can the current user reassign this person's role?
  const canAssignRoleFor = (p: Person): boolean => {
    if (grantableRoles.length === 0) return false;      // not owner/admin
    const uid = personId(p);
    if (!uid || uid === myId) return false;             // never your own role
    const targetRole = roleFromUser(p);
    if (targetRole === 'owner') return false;           // an owner is never reassigned in-app
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

  if (loading) return <div className="min-vh-100 bg-gray-50 d-flex align-items-center justify-content-center"><div className="spinner-border text-primary" /></div>;

  return (
    <div className="min-vh-100 bg-gray-50">
      <div className="container px-3 py-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h1 className="h3 mb-1 d-flex align-items-center gap-2"><Users size={20}/> People</h1>
            <div className="small text-muted">Full org directory — ordered by authority: Owner → Leadership → Admin → IT → Teams. Generate titles via OpenRouter.</div>
          </div>
          <Link to="/profile" className="btn btn-outline-secondary btn-sm">Edit your profile</Link>
        </div>

        {grantableRoles.length > 0 && (
          <div className="small text-muted mb-3 d-flex align-items-center gap-1">
            <ShieldCheck size={14}/>
            {myRole === 'owner'
              ? 'As Owner you can grant Admin, Leadership and team roles.'
              : 'As Admin you can grant Leadership and team roles.'}
          </div>
        )}

        {people.length === 0 ? (
          <div className="card-modern bg-white p-5 text-center">
            <div className="small text-muted">No members found yet. New accounts appear here once they finish onboarding.</div>
          </div>
        ) : (
          <div className="row g-3">
            {people.map(p => {
              const uid = personId(p) || Math.random().toString(36);
              const role = roleFromUser(p);
              const meta = role ? ROLES[role] : null;
              const title = p.specializedTitle || p.metadata?.specializedTitle || '';
              const gh = p.githubUsername || p.metadata?.githubUsername;
              const showRoleControl = canAssignRoleFor(p);
              return (
                <div key={String(uid)} className="col-md-6 col-lg-4">
                  <div className="card-modern bg-white p-4 h-100 d-flex flex-column gap-2" style={{ borderLeft: `3px solid ${meta?.color || '#e5e7eb'}` }}>
                    <div className="d-flex align-items-center gap-3">
                      {p.avatarUrl ? <img src={p.avatarUrl} alt={p.name} style={{ width: 44, height: 44, borderRadius: 999, objectFit: 'cover' }} /> : <div className="d-inline-flex align-items-center justify-content-center rounded-circle text-white fw-bold" style={{ width:44, height:44, background: meta?.color || '#6b7280' }}>{(p.name||'U').charAt(0).toUpperCase()}</div>}
                      <div>
                        <div className="fw-semibold text-dark">{p.name || p.username || 'Unknown'}</div>
                        <div className="small text-muted d-flex align-items-center gap-1">{meta ? <span className="px-2 py-1 rounded-pill text-white" style={{ background: meta.color, fontSize: 11 }}>{meta.shortLabel}</span> : <span className="small text-muted">Member</span>} {title && <span>· {title}</span>}</div>
                      </div>
                    </div>
                    <div className="small text-muted"><strong>Role (app role):</strong> {meta?.label || role || '—'}</div>
                    <div className="small"><strong>Specialized Title (from Deepiri):</strong> {title || <span className="text-muted">—</span>}</div>
                    {p.bio && <div className="small text-muted" style={{ lineHeight: 1.5 }}>{p.bio}</div>}
                    {summaries[personId(p)] && <div className="small p-2 rounded-3 border bg-light"><strong>Summary (OpenRouter):</strong> {summaries[personId(p)]}</div>}

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

                    <div className="d-flex gap-2 mt-2">
                      <button className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1" onClick={()=>generateTitle(p)} disabled={generating===String(uid)}>
                        <Sparkles size={14}/> {generating===String(uid) ? 'Generating…' : 'Generate Title'}
                      </button>
                      {gh && <a href={`https://github.com/${gh}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"><Github size={14}/> @{gh} <ExternalLink size={12}/></a>}
                    </div>
                    <div className="mt-2">
                      <div className="small fw-semibold mb-1">Last few things</div>
                      {(activity[String(uid)]||[]).length===0 ? <div className="small text-muted">No GH activity yet — connect GitHub in Profile → Integrations.</div> : (activity[String(uid)]||[]).map((a:any,i:number)=>(<div key={i} className="small text-muted d-flex justify-content-between border-top py-1"><span>{a.title || a.message || a.type || 'activity'}</span><span>{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ''}</span></div>))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="small text-muted mt-3">Activity feeds still need <code>GET /api/users/:id/activity</code> (GH via <code>external-bridge GITHUB_TOKEN</code>) and <code>POST /api/integrations/openrouter/generate-title</code> (proxy with Redis cache).</div>
      </div>
    </div>
  );
};

export default People;
