import { describe, expect, it } from 'vitest';
import { getNextMeetingDate, TEAM_MEETINGS } from '../data/meetings';

// Regression test for the Dashboard's "Next Events" bug: every synthetic
// meeting card used to show `now + 24h` regardless of the meeting's actual
// day/time, so every card displayed the same hour. This asserts each
// meeting's next occurrence lands on its correct weekday and EST-derived
// UTC hour instead.

describe('getNextMeetingDate', () => {
  it('computes the correct next Monday 9:30pm EST (02:30 UTC) for the AI/ML weekly meeting', () => {
    const aiMl = TEAM_MEETINGS.find(m => m.id === 'ai-ml-weekly')!;
    // A known Wednesday, well before that week's Monday meeting has passed.
    const now = new Date(Date.UTC(2026, 8, 2, 12, 0)); // 2026-09-02 (Wednesday)
    const next = getNextMeetingDate(aiMl, now);

    expect(next.getUTCDay()).toBe(1); // Monday
    expect(next.getUTCHours()).toBe(2); // 9:30pm EST -> 02:30 UTC next day
    expect(next.getUTCMinutes()).toBe(30);
    expect(next.getTime()).toBeGreaterThan(now.getTime());
  });

  it('gives different meetings different next-occurrence times, not a flat +24h for all', () => {
    const aiMl = TEAM_MEETINGS.find(m => m.id === 'ai-ml-weekly')!;
    const qa = TEAM_MEETINGS.find(m => m.id === 'qa-weekly')!;
    const infra = TEAM_MEETINGS.find(m => m.id === 'infra-weekly')!;
    const now = new Date(Date.UTC(2026, 8, 2, 12, 0));

    const times = new Set([
      getNextMeetingDate(aiMl, now).getTime(),
      getNextMeetingDate(qa, now).getTime(),
      getNextMeetingDate(infra, now).getTime(),
    ]);

    expect(times.size).toBe(3);
  });

  it('rolls over to next week once this week\'s occurrence has passed', () => {
    const aiMl = TEAM_MEETINGS.find(m => m.id === 'ai-ml-weekly')!;
    // Just after this week's Monday 02:30 UTC meeting instant.
    const now = new Date(Date.UTC(2026, 8, 7, 3, 0)); // Monday 2026-09-07, 03:00 UTC
    const next = getNextMeetingDate(aiMl, now);

    expect(next.getTime()).toBeGreaterThan(now.getTime());
    expect(next.getUTCDay()).toBe(1);
    const daysAhead = Math.round((next.getTime() - now.getTime()) / 86400000);
    expect(daysAhead).toBeGreaterThanOrEqual(6);
  });
});
