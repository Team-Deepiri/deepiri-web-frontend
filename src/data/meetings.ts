import type { DeepiriRole } from '../types/roles';

export type MeetingCadence = 'weekly' | 'triweekly' | 'monthly';

export interface TeamMeeting {
  id: string;
  title: string;
  cadence: MeetingCadence;
  dayLabel: string; // e.g. Mondays
  timeEST: string; // e.g. 9:30 pm EST
  timeCST: string;
  timeMST: string;
  timePST: string;
  roles: DeepiriRole[];
  description: string;
  calendarUrl?: string;
  location: string; // e.g. Google Meet / Zoom
}

export const TEAM_MEETINGS: TeamMeeting[] = [
  {
    id: 'ai-ml-weekly',
    title: 'AI/ML Team',
    cadence: 'weekly',
    dayLabel: 'Mondays',
    timeEST: '9:30 pm EST',
    timeCST: '8:30 pm CST',
    timeMST: '7:30 pm MST',
    timePST: '6:30 pm PST',
    roles: ['ai_ml', 'it', 'admin', 'leadership'],
    description: 'Attend if your main role is @AI Systems Engineer, @ML Engineer, @MLOps Engineer or @Data Engineer',
    location: 'Google Meet',
  },
  {
    id: 'qa-weekly',
    title: 'QA Team',
    cadence: 'weekly',
    dayLabel: 'Mondays',
    timeEST: '10:00 pm EST',
    timeCST: '9:00 pm CST',
    timeMST: '8:00 pm MST',
    timePST: '7:00 pm PST',
    roles: ['qa_support', 'it', 'admin', 'leadership'],
    description: 'Attend if your main role is @QA Engineer or @DevOps Engineer',
    location: 'Google Meet',
  },
  {
    id: 'infra-weekly',
    title: 'Infrastructure / Application Team',
    cadence: 'weekly',
    dayLabel: 'Tuesdays',
    timeEST: '9:00 pm EST',
    timeCST: '8:00 pm CST',
    timeMST: '7:00 pm MST',
    timePST: '6:00 pm PST',
    roles: ['software_developer', 'it', 'admin', 'leadership'],
    description: 'Attend if your role is @Cloud/Infra/Security, @Full Stack, @Backend or @Frontend Engineer',
    location: 'Google Meet',
  },
  {
    id: 'ai-research-triweekly',
    title: 'AI Research Design — Tri-Weekly',
    cadence: 'triweekly',
    dayLabel: 'Tuesdays (every 3 weeks)',
    timeEST: '10:00 pm EST',
    timeCST: '9:00 pm CST',
    timeMST: '8:00 pm MST',
    timePST: '7:00 pm PST',
    roles: ['ai_ml', 'it', 'admin', 'leadership'],
    description: 'Tri-weekly deep-dive on AI research & design. Open to AI/ML + IT/Leadership.',
    calendarUrl: 'https://calendar.app.google/SPHtqLyNsCrw682t9',
    location: 'Google Calendar',
  },
  {
    id: 'management-monthly',
    title: 'Monthly Management Meeting',
    cadence: 'monthly',
    dayLabel: '1st Thursday of every month',
    timeEST: '9:00 pm EST',
    timeCST: '8:00 pm CST',
    timeMST: '7:00 pm MST',
    timePST: '6:00 pm PST',
    roles: ['leadership', 'admin', 'it'],
    description: 'Leadership sync — roadmap, hiring, ops. Leadership + Admin + IT welcome.',
    calendarUrl: 'https://calendar.app.google/3A3zDsDzPFsuXmmAA',
    location: 'Google Calendar',
  },
];

export function getNextOccurrenceLabel(m: TeamMeeting): string {
  return `${m.dayLabel} · ${m.timeEST} / ${m.timeCST} / ${m.timeMST} / ${m.timePST}`;
}

export function isIntermittent(m: TeamMeeting): boolean {
  return m.cadence !== 'weekly';
}

const WEEKDAY_INDEX: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

function extractWeekday(dayLabel: string): number | null {
  const lower = dayLabel.toLowerCase();
  for (const [name, idx] of Object.entries(WEEKDAY_INDEX)) {
    if (lower.includes(name)) return idx;
  }
  return null;
}

// EST label here is a fixed UTC-5 offset, matching how this file already labels
// EST/CST/MST/PST as static strings rather than DST-adjusting them.
function parseEstTimeToUtcHourMinute(timeEST: string): { hour: number; minute: number } {
  const match = timeEST.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
  if (!match) return { hour: 21, minute: 0 };
  let hour = parseInt(match[1], 10) % 12;
  if (match[3].toLowerCase() === 'pm') hour += 12;
  const minute = parseInt(match[2], 10);
  return { hour: (hour + 5) % 24, minute };
}

// The dashboard's "Next Events" card needs a real Date per meeting, not a
// generic placeholder -- previously every synthetic event used `now + 24h`
// regardless of the meeting's actual day/time, so every card showed the same
// time (whatever hour the page happened to load at). This computes the next
// real occurrence of the meeting's weekday + EST time, in UTC.
export function getNextMeetingDate(m: TeamMeeting, now: Date = new Date()): Date {
  const { hour, minute } = parseEstTimeToUtcHourMinute(m.timeEST);
  const weekday = extractWeekday(m.dayLabel);

  if (weekday === null) {
    // No parseable weekday (shouldn't happen for current data) -- fall back to
    // "next occurrence of this UTC time", which is still per-meeting-accurate
    // rather than a flat +24h for every card.
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hour, minute));
    if (d.getTime() <= now.getTime()) d.setUTCDate(d.getUTCDate() + 1);
    return d;
  }

  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hour, minute));
  let daysAhead = (weekday - d.getUTCDay() + 7) % 7;
  if (daysAhead === 0 && d.getTime() <= now.getTime()) daysAhead = 7;
  d.setUTCDate(d.getUTCDate() + daysAhead);
  return d;
}
