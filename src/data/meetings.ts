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
    timeEST: '9:30 pm EST',
    timeCST: '8:30 pm CST',
    timeMST: '7:30 pm MST',
    timePST: '6:30 pm PST',
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
  return `${m.dayLabel} · ${m.timeEST} / ${m.timePST}`;
}

export function isIntermittent(m: TeamMeeting): boolean {
  return m.cadence !== 'weekly';
}
