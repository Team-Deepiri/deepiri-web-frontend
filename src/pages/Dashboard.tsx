import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useAdventure } from '../contexts/AdventureContext';
import { userApi } from '../api/userApi';
import { eventApi } from '../api/eventApi';
import { externalApi } from '../api/externalApi';
import MeetingSchedule from '../components/MeetingSchedule';
import RoleSelector from '../components/RoleSelector';
import { getUserRole } from '../utils/roles';
import type { DeepiriRole } from '../types/roles';
import { ROLES } from '../types/roles';
import { getToolsForRole } from '../data/tools';
import { TEAM_MEETINGS } from '../data/meetings';
import axiosInstance from '../api/axiosInstance';
import { Calendar, Megaphone, Users, Clock, Video, Wrench, ArrowRight, Activity, Rocket } from 'lucide-react';
import toast from 'react-hot-toast';
import type { AppLocation } from '../types/common';

interface Event {
  _id?: string;
  id?: string;
  name?: string;
  description?: string;
  startTime?: string;
  location?: { address?: string };
  type?: string;
  participants?: string[];
}

const Dashboard: React.FC = () => {
  const { user, deepiriRole, setDeepiriRole } = useAuth();
  const { userLocation } = useAdventure();
  const [events, setEvents] = useState<Event[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<{ jobs: any[]; registry: any[] }>({ jobs: [], registry: [] });
  const [loading, setLoading] = useState(true);
  const [showAllMeetings, setShowAllMeetings] = useState(false);
  const [localRole, setLocalRole] = useState<DeepiriRole | null>(deepiriRole || getUserRole(user));

  useEffect(() => {
    setLocalRole(deepiriRole || getUserRole(user));
  }, [deepiriRole, user]);

  // Keep showAll in sync with privileged roles
  useEffect(() => {
    if (localRole === 'it' || localRole === 'admin' || localRole === 'leadership') setShowAllMeetings(true);
  }, [localRole]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [statsRes, eventsRes, annRes, jobsRes, registryRes] = await Promise.all([
          userApi.getStats().catch(() => ({ success: false })),
          eventApi.getUserEvents().catch(() => ({ success: false, data: [] })),
          axiosInstance.get('/announcements').then(r => r.data).catch(() => ({ announcements: [] })),
          axiosInstance.get('/jobs').then(r => r.data).catch(() => ({ jobs: [] })),
          axiosInstance.get('/registry').then(r => r.data).catch(() => ({ entries: [] })),
        ]);
        if ((statsRes as any)?.success) setStats((statsRes as any).data);
        // recent activity
        const jobsList = (jobsRes as any)?.jobs || (jobsRes as any)?.data || (Array.isArray(jobsRes) ? jobsRes : []);
        const regList = (registryRes as any)?.entries || (registryRes as any)?.data || (Array.isArray(registryRes) ? registryRes : []);
        setRecentActivity({ jobs: Array.isArray(jobsList) ? jobsList.slice(0, 3) : [], registry: Array.isArray(regList) ? regList.slice(0, 3) : [] });
        let ev: Event[] = [];
        if ((eventsRes as any)?.success || (eventsRes as any)?.data) ev = (eventsRes as any).data || [];
        if (userLocation) {
          try {
            const lat = 'latitude' in userLocation ? (userLocation as any).latitude : (userLocation as any).lat;
            const lng = 'longitude' in userLocation ? (userLocation as any).longitude : (userLocation as any).lng;
            const loc: AppLocation = { latitude: lat, longitude: lng };
            const ext = await externalApi.getNearbyEvents(loc, 5000).catch(() => ({ success: false, data: [] }));
            if ((ext as any)?.success && Array.isArray((ext as any).data)) ev = [...ev, ...(ext as any).data];
          } catch {}
        }
        // Next Events: always show something — if empty, use TEAM_MEETINGS as synthetic events
        if (ev.length === 0) {
          const synthetic: Event[] = TEAM_MEETINGS.slice(0, 3).map(m => ({
            id: `meeting-${m.id}`,
            _id: `meeting-${m.id}`,
            name: m.title,
            description: m.description,
            startTime: new Date(Date.now() + 24*60*60*1000).toISOString(),
            location: { address: m.location },
            type: 'team-meeting',
          }));
          ev = synthetic;
        }
        setEvents(ev.slice(0, 6));
        const annList = (annRes as any)?.announcements || (annRes as any)?.data || (Array.isArray(annRes) ? annRes : []);
        setAnnouncements(Array.isArray(annList) ? annList.slice(0, 5) : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userLocation]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <div className="min-vh-100 bg-gray-50 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading…</span></div>
      </div>
    );
  }

  const roleMeta = localRole ? ROLES[localRole] : null;

  const firstName = (user?.name || '').trim().split(' ')[0] || 'there';

  return (
    <div className="min-vh-100 bg-gray-50">
      <div className="container px-3 py-4">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <div className="card-modern bg-white p-4 d-flex flex-column gap-3">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div>
                <h1 className="h2 mb-1" style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>{greeting()}, {firstName}!</h1>
                <div className="text-muted small">Home base of Deepiri operations — events, meetings, and your team.</div>
              </div>
              <div className="d-flex align-items-center gap-2">
                {roleMeta ? (
                  <span className="px-3 py-2 rounded-pill text-white small fw-semibold d-inline-flex align-items-center gap-2" style={{ background: roleMeta.color }}>
                    <span>{roleMeta.icon}</span> {roleMeta.label}
                  </span>
                ) : (
                  <span className="badge bg-warning text-dark">No role selected</span>
                )}
                <Link to="/profile" className="btn btn-outline-secondary btn-sm">Change role</Link>
              </div>
            </div>

            {!localRole && (
              <div className="p-3 rounded-3" style={{ background: '#fffbeb', border: '1px solid #fcd34d' }}>
                <div className="small fw-semibold mb-2">Pick your Deepiri role to see the right meetings:</div>
                <RoleSelector value={localRole} onChange={(r) => { setLocalRole(r); setDeepiriRole(r); toast.success(`Role set to ${ROLES[r].label}`); }} />
              </div>
            )}
          </div>
        </motion.div>

        <div className="row g-4">
          {/* Left: Meetings + Events */}
          <div className="col-lg-8 d-flex flex-column gap-4">
            {/* Meetings */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h2 className="h5 mb-0 d-flex align-items-center gap-2"><Users size={18} /> Team Meetings</h2>
                {localRole && (
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => setShowAllMeetings(!showAllMeetings)}>
                    {showAllMeetings ? 'Show my meetings' : 'Show all meetings'}
                  </button>
                )}
              </div>
              <MeetingSchedule userRole={localRole} showAll={showAllMeetings} />
            </motion.div>

            {/* Upcoming Events */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-modern bg-white p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h3 className="h5 mb-0 d-flex align-items-center gap-2"><Calendar size={18} /> Upcoming Events</h3>
                <Link to="/events" className="btn btn-sm btn-outline-primary">View all</Link>
              </div>

              {events.length === 0 ? (
                <div className="text-center py-4">
                  <div className="text-muted small mb-2">No events yet — create one or check back after your next team meeting.</div>
                  <Link to="/events" className="btn btn-primary btn-sm">Browse Events</Link>
                  <Link to="/events/create" className="btn btn-outline-secondary btn-sm ms-2">Create Event</Link>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {events.map((e, idx) => {
                    const cid = e._id || e.id || String(idx);
                    const isMeeting = String(cid).startsWith('meeting-');
                    const gcal = e.startTime ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(e.name || 'Event')}&dates=${new Date(e.startTime).toISOString().replace(/[-:]/g,'').split('.')[0]}Z/${new Date(new Date(e.startTime).getTime()+60*60*1000).toISOString().replace(/[-:]/g,'').split('.')[0]}Z&details=${encodeURIComponent(e.description || '')}` : null;
                    return (
                    <div key={cid} className="p-3 rounded-3 border d-flex align-items-center justify-content-between gap-3" style={{ background: 'white' }}>
                      <div className="flex-grow-1">
                        {isMeeting ? (
                          <div className="fw-semibold text-dark">{e.name || 'Untitled Event'}</div>
                        ) : (
                          <Link to={`/events/${cid}`} className="fw-semibold text-dark text-decoration-none">{e.name || 'Untitled Event'}</Link>
                        )}
                        <div className="small text-muted d-flex align-items-center gap-2">
                          <Clock size={12} /> {e.startTime ? new Date(e.startTime).toLocaleString() : 'Time TBD'}
                          {e.location?.address && <span>· {e.location.address}</span>}
                        </div>
                        {e.description && <div className="small text-muted mt-1" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{e.description}</div>}
                      </div>
                      <div className="d-flex flex-column align-items-end gap-1">
                        <span className="badge bg-light text-dark border" style={{ whiteSpace: 'nowrap' }}>{e.type || 'event'}</span>
                        {gcal && <a href={gcal} target="_blank" rel="noreferrer" className="small text-primary">Add to Google Calendar →</a>}
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* Announcements Window — Norozo forwards Discord #announcements */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }} className="card-modern bg-white p-4" id="announcements">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h3 className="h5 mb-0 d-flex align-items-center gap-2"><Megaphone size={18} /> Announcements <span className="badge bg-light text-muted border small fw-normal">Norozo → Discord #announcements</span></h3>
                <Link to="/tools/announce" className="btn btn-sm btn-primary">Create</Link>
              </div>
              {announcements.length === 0 ? (
                <div className="text-center py-3">
                  <div className="small text-muted mb-2">No announcements yet. Norozo will auto-forward every post from Discord #announcements (1436509524818395156) here.</div>
                  <div className="small text-muted">Create one via the tool above — it appears here and in Discord.</div>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {announcements.map((a: any) => (
                    <div key={a.id || a._id} className="p-3 rounded-3 border" style={{ background: '#ffffff' }}>
                      <div className="fw-semibold text-dark">{a.title}</div>
                      <div className="small text-muted mt-1" style={{ whiteSpace: 'pre-wrap' }}>{a.body}</div>
                      <div className="small text-muted mt-2">{a.authorName || a.author || 'Norozo'} · {a.createdAt ? new Date(a.createdAt).toLocaleString() : ''}</div>
                    </div>
                  ))}
                </div>
              )}
              <div className="small text-muted mt-3">Forwarded automatically by Norozo bot (DISCORD_BOT_TOKEN). Channel: #announcements → <code>POST /api/webhooks/norozo/announcements</code> with <code>X-Norozo-Secret</code>.</div>
            </motion.div>

            {/* Tools Preview — role-filtered grid */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card-modern bg-white p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h3 className="h6 mb-0 d-flex align-items-center gap-2"><Wrench size={16} /> Your Tools</h3>
                <Link to="/tools" className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1">View all <ArrowRight size={14} /></Link>
              </div>
              <div className="row g-3">
                {getToolsForRole(localRole).slice(0, 6).map(t => {
                  const Icon = t.icon;
                  return (
                    <div key={t.id} className="col-6">
                      <Link to={t.route} className="p-3 rounded-3 d-block text-decoration-none border d-flex align-items-center gap-2" style={{ background: '#f8fafc', borderTop: `2px solid ${t.color}` }}>
                        <span className="d-inline-flex align-items-center justify-content-center rounded-2" style={{ width: 28, height: 28, background: `${t.color}15`, color: t.color }}><Icon size={14} /></span>
                        <div><div className="small fw-semibold text-dark">{t.label}</div><div className="small text-muted" style={{ lineHeight: 1.2 }}>{t.description.slice(0, 32)}…</div></div>
                      </Link>
                    </div>
                  );
                })}
                {(!localRole || getToolsForRole(localRole).length === 0) && (
                  <div className="col-12 small text-muted">Pick a role in Profile to unlock tools. Admin sees all.</div>
                )}
              </div>
            </motion.div>

            {/* Recent Activity strip */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="card-modern bg-white p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h3 className="h6 mb-0 d-flex align-items-center gap-2"><Activity size={16} /> Recent Activity</h3>
                <Link to="/ops/jobs" className="small text-primary text-decoration-none">Jobs →</Link>
              </div>
              <div className="row g-3 small">
                <div className="col-md-4">
                  <div className="fw-semibold mb-2">Jobs</div>
                  {recentActivity.jobs.length === 0 ? <div className="text-muted">No recent jobs.</div> : recentActivity.jobs.map((j:any, i:number) => (
                    <div key={j.id||i} className="border rounded-2 p-2 mb-1 bg-light">{j.type || j.name || 'Job'} · <span className="text-muted">{j.status || 'pending'}</span></div>
                  ))}
                </div>
                <div className="col-md-4">
                  <div className="fw-semibold mb-2">Registry</div>
                  {recentActivity.registry.length === 0 ? <div className="text-muted">No recent registry entries.</div> : recentActivity.registry.map((r:any,i:number) => (
                    <div key={r.id||i} className="border rounded-2 p-2 mb-1 bg-light">{r.service || r.name || 'Service'} · <span className="text-muted">{r.status || 'ok'}</span></div>
                  ))}
                </div>
                <div className="col-md-4">
                  <div className="fw-semibold mb-2">Announcements</div>
                  {announcements.length === 0 ? <div className="text-muted">No announcements.</div> : announcements.slice(0,3).map((a:any)=> (
                    <div key={a.id||a._id} className="border rounded-2 p-2 mb-1 bg-light">{a.title}</div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Role detail + Stats + Tips */}
          <div className="col-lg-4 d-flex flex-column gap-4">
            {localRole && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-modern bg-white p-4" style={{ borderLeft: `4px solid ${roleMeta?.color}` }}>
                <div className="small text-muted" style={{ letterSpacing: '0.5px' }}>YOUR ROLE</div>
                <div className="h5 mb-1">{roleMeta?.label}</div>
                <div className="small text-muted mb-2">{roleMeta?.description}</div>
                <div className="small">
                  <strong>GitHub team:</strong> {roleMeta?.githubTeam}<br />
                  <strong>Meetings for you:</strong> {showAllMeetings ? 'All (IT/Admin/Lead)' : 'Filtered to your team + universal'}
                </div>
                {localRole === 'it' && <div className="alert alert-warning py-2 px-3 small mt-3 mb-0">IT can attend any meeting.</div>}
              </motion.div>
            )}

            {stats && stats.totalPoints != null && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-3 p-4 border">
                <div className="h6 mb-3">Your Stats</div>
                <div className="d-flex flex-column gap-2 small">
                  <div className="d-flex justify-content-between"><span className="text-muted">Adventures</span><span className="fw-semibold">{stats.adventureStats?.completed || 0}</span></div>
                  <div className="d-flex justify-content-between"><span className="text-muted">Points</span><span className="fw-semibold">{stats.totalPoints || 0}</span></div>
                  <div className="d-flex justify-content-between"><span className="text-muted">Streak</span><span className="fw-semibold">{stats.streak || 0} days</span></div>
                  <div className="d-flex justify-content-between"><span className="text-muted">Friends</span><span className="fw-semibold">{stats.friendsCount || 0}</span></div>
                </div>
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-modern bg-white p-4">
              <div className="h6 d-flex align-items-center gap-2"><Megaphone size={16} /> How meetings work</div>
              <div className="small text-muted" style={{ lineHeight: 1.6 }}>
                Weekly team meetings are mandatory for your primary role. Intermittent tri-weekly (AI Research) and monthly management are opt-in for relevant roles. IT/Admin/Leadership may attend any.
                <br /><br />
                <Video size={12} className="me-1" /> All meetings on Google Meet / Calendar. Click <strong>Add to Calendar</strong> on each card.
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
