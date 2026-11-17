import { describe, expect, it } from '@jest/globals';

import { sampleMe } from '../sample';
import {
  BIO_MAX, NAME_MAX, STATUS_MAX, fullName, profileBadges, profileStats, validateProfile,
} from '../selectors';
import type { Plan } from '../types';
import { ME_ID } from '../types';

const plan = (id: string, hostId: string, memberIds: string[]): Plan => ({
  id, hostId, memberIds, title: 'x', category: 'Food', startsAt: '2026-12-01T10:00:00', placeName: 'Café',
  maxMembers: 6, womenOnly: false,
});

describe('profileStats', () => {
  const plans = [
    plan('a', 'riya', ['riya', ME_ID]),
    plan('b', 'karan', ['karan', ME_ID]),
    plan('c', ME_ID, [ME_ID]),
    plan('d', 'meera', ['meera']),
  ];

  it('counts joined (not hosted), hosted, people met and regulars', () => {
    expect(profileStats(plans, { sana: 3, meera: 2, karan: 1 })).toEqual({
      plansJoined: 2, plansHosted: 1, peopleMet: 3, regulars: 2,
    });
  });

  it('leaves blocked people out of the counts', () => {
    expect(profileStats(plans, { sana: 3, meera: 2, karan: 1 }, ['sana'])).toMatchObject({ peopleMet: 2, regulars: 1 });
  });
});

describe('profileBadges', () => {
  it('earns badges only from real activity', () => {
    const none = profileBadges({ ...sampleMe, verified: false }, { plansJoined: 0, plansHosted: 0, peopleMet: 0, regulars: 0 });
    expect(none.every((b) => !b.earned)).toBe(true);

    const all = profileBadges(sampleMe, { plansJoined: 3, plansHosted: 1, peopleMet: 4, regulars: 1 });
    expect(all.every((b) => b.earned)).toBe(true);
  });

  it('needs 3 joined plans for Explorer', () => {
    const b = profileBadges(sampleMe, { plansJoined: 2, plansHosted: 0, peopleMet: 0, regulars: 0 });
    expect(b.find((x) => x.id === 'explorer')!.earned).toBe(false);
  });
});

describe('fullName', () => {
  it('joins first and last name, or shows just the first', () => {
    expect(fullName({ name: 'Neha', lastName: 'Sharma' })).toBe('Neha Sharma');
    expect(fullName({ name: 'Neha' })).toBe('Neha');
    expect(fullName({ name: 'Neha', lastName: '' })).toBe('Neha');
  });
});

describe('validateProfile', () => {
  const ok = { name: 'Neha', age: '30', area: 'Baner', bio: 'Hi' };

  it('accepts a valid profile', () => {
    expect(validateProfile(ok)).toEqual({});
  });

  it('requires a name of 1–40 characters', () => {
    expect(validateProfile({ ...ok, name: '   ' }).name).toBeDefined();
    expect(validateProfile({ ...ok, name: 'x'.repeat(41) }).name).toBeDefined();
  });

  it('requires an adult age as a whole number', () => {
    expect(validateProfile({ ...ok, age: '17' }).age).toMatch(/18 and over/);
    expect(validateProfile({ ...ok, age: '18' }).age).toBeUndefined();
    expect(validateProfile({ ...ok, age: 'abc' }).age).toBeDefined();
    expect(validateProfile({ ...ok, age: '25.5' }).age).toBeDefined();
    expect(validateProfile({ ...ok, age: '120' }).age).toBeDefined();
  });

  it('allows an empty last name and status, but limits their length', () => {
    expect(validateProfile({ ...ok, lastName: '', status: '' })).toEqual({});
    expect(validateProfile({ ...ok, lastName: 'x'.repeat(NAME_MAX + 1) }).lastName).toBeDefined();
    expect(validateProfile({ ...ok, status: 'x'.repeat(STATUS_MAX) }).status).toBeUndefined();
    expect(validateProfile({ ...ok, status: 'x'.repeat(STATUS_MAX + 1) }).status).toBeDefined();
  });

  it('requires an area and limits the bio length', () => {
    expect(validateProfile({ ...ok, area: ' ' }).area).toBeDefined();
    expect(validateProfile({ ...ok, bio: 'x'.repeat(BIO_MAX) }).bio).toBeUndefined();
    expect(validateProfile({ ...ok, bio: 'x'.repeat(BIO_MAX + 1) }).bio).toBeDefined();
  });
});
