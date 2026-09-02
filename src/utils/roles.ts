import type { DeepiriRole } from '../types/roles';
import { ROLES } from '../types/roles';
import { TEAM_MEETINGS, type TeamMeeting } from '../data/meetings';

const STORAGE_KEY = 'deepiri_role';

export function getStoredRole(): DeepiriRole | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    if ((Object.keys(ROLES) as DeepiriRole[]).includes(raw as DeepiriRole)) return raw as DeepiriRole;
    return null;
  } catch {
    return null;
  }
}

export function setStoredRole(role: DeepiriRole): void {
  localStorage.setItem(STORAGE_KEY, role);
  // also persist into user metadata if available
  try {
    const raw = localStorage.getItem('user');
    if (raw) {
      const u = JSON.parse(raw);
      u.metadata = { ...(u.metadata || {}), deepiriRole: role };
      localStorage.setItem('user', JSON.stringify(u));
    }
  } catch { /* ignore */ }
}

// Read an explicit role off any user-like object (a session user or a People
// directory row). The server `role` column is authoritative — checked first so
// a stale localStorage `metadata.deepiriRole` can't present a higher role than
// the backend granted — then the legacy metadata fields. Returns null when none
// is a known role; no fallback to the stored role, so it's safe for directory
// rows that aren't the current user.
export function roleFromUser(user: any): DeepiriRole | null {
  if (!user) return null;
  const candidates = [user.role, user.deepiriRole, user.metadata?.deepiriRole, user.metadata?.role];
  for (const c of candidates) {
    if (c && (Object.keys(ROLES) as string[]).includes(c)) return c as DeepiriRole;
  }
  return null;
}

// Read an explicit role off any user-like object (a session user or a People
// directory row). The server `role` column is authoritative — checked first so
// a stale localStorage `metadata.deepiriRole` can't present a higher role than
// the backend granted — then the legacy metadata fields. Returns null when none
// is a known role; no fallback to the stored role, so it's safe for directory
// rows that aren't the current user.
export function roleFromUser(user: any): DeepiriRole | null {
  if (!user) return null;
  const candidates = [user.role, user.deepiriRole, user.metadata?.deepiriRole, user.metadata?.role];
  for (const c of candidates) {
    if (c && (Object.keys(ROLES) as string[]).includes(c)) return c as DeepiriRole;
  }
  return null;
}

export function getUserRole(user: any): DeepiriRole | null {
  return roleFromUser(user) ?? getStoredRole();
}

export function hasRole(user: any, role: DeepiriRole): boolean {
  const r = getUserRole(user);
  if (!r) return false;
  if (r === role) return true;
  // IT, admin, leadership, owner see all
  if (r === 'it' || r === 'admin' || r === 'leadership' || r === 'owner') return true;
  return false;
}

export function canAttendMeeting(userRole: DeepiriRole | null, meeting: TeamMeeting): boolean {
  if (!userRole) return true; // show all if no role set, with hint
  if (meeting.roles.includes(userRole)) return true;
  // IT/admin/leadership/owner can attend any
  if (userRole === 'it' || userRole === 'admin' || userRole === 'leadership' || userRole === 'owner') return true;
  return false;
}

export function getRelevantMeetings(userRole: DeepiriRole | null): TeamMeeting[] {
  if (!userRole) return TEAM_MEETINGS;
  return TEAM_MEETINGS.filter(m => canAttendMeeting(userRole, m));
}

export function isPrivilegedRole(role: DeepiriRole | null): boolean {
  return role === 'it' || role === 'admin' || role === 'leadership' || role === 'owner';
}

export function roleLabel(role: DeepiriRole | null): string {
  if (!role) return 'No role selected';
  return ROLES[role]?.label || role;
}
