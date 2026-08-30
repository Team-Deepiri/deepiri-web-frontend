import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { ROLES } from '../types/roles';
import type { DeepiriRole } from '../types/roles';
import { Users, Sparkles, Github, ExternalLink } from 'lucide-react';
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

const People: React.FC = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState<Record<string, any[]>>({});
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // Try real endpoint, fallback to mock from localStorage + demo
        let list: Person[] = [];
        try {
          const res = await axiosInstance.get('/users').then(r=>r.data).catch(()=>null);
          const data = res?.users || res?.data || res;
          if (Array.isArray(data) && data.length) list = data;
        } catch {}
        if (list.length === 0) {
          // fallback demo + current user
          let current: any = null;
          try { current = JSON.parse(localStorage.getItem('user') || 'null'); } catch {}
          const demo: Person[] = [
            { id: 'demo-1', name: 'Alex Rivera', email: 'alex@deepiri.app', bio: 'ML platform & data pipelines', deepiriRole: 'ai_ml', specializedTitle: 'MLOps Architect', githubUsername: 'deepiri-alex' },
            { id: 'demo-2', name: 'Sam Chen', email: 'sam@deepiri.app', bio: 'Frontend + design systems', deepiriRole: 'software_developer', specializedTitle: 'Product Engineer — Portal', githubUsername: 'deepiri-sam' },
          ];
          if (current) {
            const r = current.metadata?.deepiriRole || current.deepiriRole || 'software_developer';
            demo.unshift({
              id: current._id || 'me',
              name: current.name || 'You',
              email: current.email,
              bio: current.metadata?.bio || 'Deepiri member',
              deepiriRole: r,
              specializedTitle: current.metadata?.specializedTitle || '',
              avatarUrl: current.avatarUrl || current.metadata?.avatarUrl,
              githubUsername: current.metadata?.githubUsername,
            });
          }
          list = demo;
        }
        // sort by authority
        list.sort((a,b) => {
          const ra = (a.deepiriRole || a.role || a.metadata?.deepiriRole || '') as string;
          const rb = (b.deepiriRole || b.role || b.metadata?.deepiriRole || '') as string;
          return roleRank(ra) - roleRank(rb);
        });
        setPeople(list);
        // lazy fetch activity/summaries best-effort
        list.forEach(p => {
          const uid = p._id || p.id || '';
          if (!uid || uid.startsWith('demo-')) return;
          axiosInstance.get(`/users/${uid}/activity`).then(r=>{
            const d = (r.data as any)?.activity || (r.data as any)?.data || [];
            if (Array.isArray(d)) setActivity(prev=>({...prev, [uid]: d.slice(0,3)}));
          }).catch(()=>{});
          axiosInstance.get(`/users/${uid}/summary`).then(r=>{
            const s = (r.data as any)?.summary || (r.data as any)?.data || '';
            if (s) setSummaries(prev=>({...prev, [uid]: String(s)}));
          }).catch(()=>{});
        });
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const generateTitle = async (p: Person) => {
    const uid = p._id || p.id || '';
    setGenerating(uid);
    try {
      const res = await axiosInstance.post('/integrations/openrouter/generate-title', { userId: uid, name: p.name, bio: p.bio }).then(r=>r.data).catch(()=>null);
      const title = res?.title || res?.data?.title || 'Deepiri Specialist — ' + (p.deepiriRole || 'Member');
      toast.success(`Generated: ${title}`);
      setPeople(prev => prev.map(x => (x._id||x.id)===uid ? { ...x, specializedTitle: title } : x));
    } catch {
      toast.error('OpenRouter proxy not configured — using local generation.');
      const fallback = `Deepiri Specialist — ${ROLES[(p.deepiriRole||'software_developer') as DeepiriRole]?.label || 'Member'}`;
      setPeople(prev => prev.map(x => (x._id||x.id)===uid ? { ...x, specializedTitle: fallback } : x));
    } finally { setGenerating(null); }
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

        {people.length === 0 ? (
          <div className="card-modern bg-white p-5 text-center">
            <div className="small text-muted">No members found. Create an account to appear here. Backend needs <code>GET /api/users</code> in <code>deepiri-auth-service</code>.</div>
          </div>
        ) : (
          <div className="row g-3">
            {people.map(p => {
              const uid = p._id || p.id || Math.random().toString(36);
              const role: DeepiriRole | null = (p.deepiriRole || p.role || p.metadata?.deepiriRole || null) as any;
              const meta = role ? ROLES[role] : null;
              const title = p.specializedTitle || p.metadata?.specializedTitle || '';
              const gh = p.githubUsername || p.metadata?.githubUsername;
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
                    {summaries[String(p._id||p.id)] && <div className="small p-2 rounded-3 border bg-light"><strong>Summary (OpenRouter):</strong> {summaries[String(p._id||p.id)]}</div>}
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
        <div className="small text-muted mt-3">Backend wiring needed: <code>GET /api/users</code>, <code>GET /api/users/:id/activity</code> (GH via <code>external-bridge GITHUB_TOKEN</code>), <code>POST /api/integrations/openrouter/generate-title</code> (proxy with Redis cache). This page works with local fallback until then.</div>
      </div>
    </div>
  );
};

export default People;
