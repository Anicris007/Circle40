import { describe, expect, it } from '@jest/globals';

import { samplePeople } from '../sample';
import { formatPlanDate, matchScore, parseTime, sharedInterests, sortByStart } from '../selectors';
import type { Plan, Profile } from '../types';

const me: Profile = {
  id: 'me', name: 'You', age: 30, area: 'Baner', bio: '', interests: ['Books', 'Brunch'], verified: true, colorIndex: 0,
};

describe('matching', () => {
  it('finds shared interests', () => {
    const riya = samplePeople.find((p) => p.id === 'riya')!;
    expect(sharedInterests(me, riya)).toEqual(['Books', 'Brunch']);
  });

  it('scores more shared interests higher, within 0–99', () => {
    const riya = samplePeople.find((p) => p.id === 'riya')!;
    const karan = samplePeople.find((p) => p.id === 'karan')!;
    expect(matchScore(me, riya)).toBeGreaterThan(matchScore(me, karan));
    for (const p of samplePeople) {
      const s = matchScore(me, p);
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(99);
    }
  });
});

describe('dates and times', () => {
  it('formats a plan date in local time', () => {
    expect(formatPlanDate('2026-11-22T05:30:00')).toEqual({ day: '22', month: 'Nov', weekday: 'Sun', time: '5:30 AM' });
    expect(formatPlanDate('2026-11-21T21:00:00').time).toBe('9:00 PM');
    expect(formatPlanDate('2026-11-21T12:05:00').time).toBe('12:05 PM');
    expect(formatPlanDate('2026-11-21T00:15:00').time).toBe('12:15 AM');
  });

  it('parses 24-hour times', () => {
    expect(parseTime('7:05')).toBe('07:05');
    expect(parseTime(' 19:00 ')).toBe('19:00');
    expect(parseTime('24:00')).toBeNull();
    expect(parseTime('12:60')).toBeNull();
    expect(parseTime('7pm')).toBeNull();
  });

  it('sorts plans by start time without changing the input', () => {
    const base = { hostId: 'x', title: '', category: 'Food', placeName: '', maxMembers: 2, womenOnly: false, memberIds: [] } as const;
    const plans: Plan[] = [
      { ...base, id: 'b', startsAt: '2026-11-22T10:00:00', memberIds: [] },
      { ...base, id: 'a', startsAt: '2026-11-20T10:00:00', memberIds: [] },
    ];
    expect(sortByStart(plans).map((p) => p.id)).toEqual(['a', 'b']);
    expect(plans.map((p) => p.id)).toEqual(['b', 'a']);
  });
});
