import React from 'react';
import { TEAM_MEETINGS } from '../data/meetings';
import { canAttendMeeting } from '../utils/roles';
import type { DeepiriRole } from '../types/roles';
import { ROLES } from '../types/roles';
import { Calendar, Clock, Video, ExternalLink, Users } from 'lucide-react';

interface Props {
  userRole: DeepiriRole | null;
  showAll?: boolean;
  onShowAll?: () => void;
}

const cadenceBadge: Record<string, { label: string; bg: string }> = {
  weekly: { label: 'Weekly', bg: '#e0e7ff' },
  triweekly: { label: 'Every 3 weeks', bg: '#fef3c7' },
  monthly: { label: 'Monthly', bg: '#fce7f3' },
};

const MeetingSchedule: React.FC<Props> = ({ userRole, showAll }) => {
  const filtered = TEAM_MEETINGS.filter(m => showAll || canAttendMeeting(userRole, m));
  const isFiltered = !showAll && userRole && filtered.length !== TEAM_MEETINGS.length;

  return (
    <div className="card-modern bg-white p-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3 className="h5 mb-0 d-flex align-items-center gap-2">
          <Calendar size={18} /> Team Meeting Schedule
        </h3>
        {userRole && (
          <span className="badge rounded-pill" style={{ background: ROLES[userRole]?.color || '#6b7280', color: 'white', fontWeight: 600 }}>
            {ROLES[userRole].shortLabel} view
          </span>
        )}
      </div>

      {isFiltered && (
        <div className="alert alert-info py-2 px-3 small mb-3" style={{ background: '#f0f9ff', border: '1px solid #bae6fd', color: '#0369a1' }}>
          Showing <strong>{filtered.length}</strong> of <strong>{TEAM_MEETINGS.length}</strong> meetings for your role. IT/Admin/Leadership see all.
        </div>
      )}

      {!userRole && (
        <div className="alert alert-warning py-2 px-3 small mb-3" style={{ background: '#fffbeb', border: '1px solid #fcd34d', color: '#92400e' }}>
          No role selected — showing all meetings. Pick your role in <strong>Profile → Professional</strong> to filter.
        </div>
      )}

      <div className="d-flex flex-column gap-3">
        {filtered.map(m => {
          const canAttend = canAttendMeeting(userRole, m);
          const badge = cadenceBadge[m.cadence];
          return (
            <div
              key={m.id}
              className="p-3 rounded-3 border"
              style={{
                background: canAttend ? '#ffffff' : '#f9fafb',
                borderColor: canAttend ? '#e5e7eb' : '#f3f4f6',
                opacity: canAttend ? 1 : 0.85,
              }}
            >
              <div className="d-flex align-items-start justify-content-between gap-2">
                <div>
                  <div className="fw-semibold d-flex align-items-center gap-2">
                    <Users size={14} className="text-muted" /> {m.title}
                    {!canAttend && <span className="badge bg-light text-muted border small">Not your team</span>}
                  </div>
                  <div className="small text-muted mt-1">{m.description}</div>
                </div>
                <span className="badge" style={{ background: badge.bg, color: '#374151', whiteSpace: 'nowrap' }}>{badge.label}</span>
              </div>

              <div className="mt-2 d-flex flex-wrap gap-2 small">
                <span className="d-inline-flex align-items-center gap-1 px-2 py-1 rounded-pill" style={{ background: '#f3f4f6' }}>
                  <Clock size={12} /> {m.dayLabel} · {m.timeEST}
                </span>
                <span className="d-inline-flex align-items-center gap-1 px-2 py-1 rounded-pill" style={{ background: '#f3f4f6' }}>
                  {m.timeCST} · {m.timeMST} · {m.timePST}
                </span>
              </div>

              <div className="mt-2 d-flex flex-wrap gap-1">
                {m.roles.map(r => (
                  <span
                    key={r}
                    className="badge rounded-pill"
                    style={{
                      background: ROLES[r].color,
                      color: 'white',
                      fontSize: '0.70rem',
                      opacity: userRole === r ? 1 : 0.85,
                    }}
                  >
                    {ROLES[r].shortLabel}
                  </span>
                ))}
              </div>

              <div className="mt-2 d-flex align-items-center gap-2 small">
                <Video size={12} className="text-muted" />
                <span className="text-muted">{m.location}</span>
                {m.calendarUrl && (
                  <a href={m.calendarUrl} target="_blank" rel="noreferrer" className="ms-auto d-inline-flex align-items-center gap-1 text-decoration-none">
                    Add to Calendar <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 small text-muted">
        All times in EST/CST/MST/PST. IT / Admin / Leadership may attend any meeting.
      </div>
    </div>
  );
};

export default MeetingSchedule;
