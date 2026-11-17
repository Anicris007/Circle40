/** Pure helpers that derive display data from app state. */
import type { Plan, Profile } from './types';
import { ME_ID } from './types';

export function sharedInterests(me: Profile, other: Profile): string[] {
  return other.interests.filter((i) => me.interests.includes(i));
}

/**
 * Simple version-1 match score (0–100): mostly shared interests, plus a bonus
 * for living in the same area. Milestone 2 moves this into a Postgres function.
 */
export function matchScore(me: Profile, other: Profile): number {
  const union = new Set([...me.interests, ...other.interests]).size || 1;
  const overlap = sharedInterests(me, other).length / union;
  const sameArea = me.area === other.area ? 5 : 0;
  return Math.min(99, Math.round(50 + overlap * 45 + sameArea));
}

export const isMember = (plan: Plan) => plan.memberIds.includes(ME_ID);
export const isHost = (plan: Plan) => plan.hostId === ME_ID;
export const isFull = (plan: Plan) => plan.memberIds.length >= plan.maxMembers;
export const spotsLeft = (plan: Plan) => Math.max(0, plan.maxMembers - plan.memberIds.length);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Parses the local date-time strings used by plans without time-zone surprises. */
export function parseLocal(iso: string): Date {
  const [d, t = '00:00'] = iso.split('T');
  const [y, m, day] = d.split('-').map(Number);
  const [hh, mm] = t.split(':').map(Number);
  return new Date(y, m - 1, day, hh, mm);
}

export function formatPlanDate(iso: string) {
  const d = parseLocal(iso);
  const hours = d.getHours();
  const h12 = hours % 12 === 0 ? 12 : hours % 12;
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return {
    day: d.getDate().toString(),
    month: MONTHS[d.getMonth()],
    weekday: DAYS[d.getDay()],
    time: `${h12}:${minutes} ${hours < 12 ? 'AM' : 'PM'}`,
  };
}

export interface ProfileStats {
  plansJoined: number;
  plansHosted: number;
  peopleMet: number;
  regulars: number;
}

/** Counts shown in the Me page header. Regulars are people met at least twice. */
export function profileStats(
  plans: Plan[], meetupCounts: Record<string, number>, blockedIds: string[] = [],
): ProfileStats {
  const met = Object.entries(meetupCounts).filter(([id, n]) => n > 0 && !blockedIds.includes(id));
  return {
    plansJoined: plans.filter((p) => isMember(p) && !isHost(p)).length,
    plansHosted: plans.filter(isHost).length,
    peopleMet: met.length,
    regulars: met.filter(([, n]) => n >= 2).length,
  };
}

export interface Badge {
  id: 'verified' | 'host' | 'regular' | 'explorer';
  label: string;
  /** How to earn it, shown while it's still locked. */
  howTo: string;
  earned: boolean;
}

/** Badges are derived from real activity, so they can't be faked in the UI. */
export function profileBadges(me: Profile, stats: ProfileStats): Badge[] {
  return [
    { id: 'verified', label: 'ID verified', howTo: 'Verify your ID', earned: me.verified },
    { id: 'host', label: 'Host', howTo: 'Host your first plan', earned: stats.plansHosted >= 1 },
    { id: 'regular', label: 'Has regulars', howTo: 'Meet someone twice', earned: stats.regulars >= 1 },
    { id: 'explorer', label: 'Explorer', howTo: 'Join 3 plans', earned: stats.plansJoined >= 3 },
  ];
}

export interface ProfileErrors {
  name?: string;
  age?: string;
  area?: string;
  bio?: string;
}

export const BIO_MAX = 400;

/** Validation for the Edit profile form. Mirrors the limits in the database schema. */
export function validateProfile(input: { name: string; age: string; area: string; bio: string }): ProfileErrors {
  const errors: ProfileErrors = {};
  const name = input.name.trim();
  if (name.length < 1) errors.name = 'Add your first name.';
  else if (name.length > 40) errors.name = 'Keep your name under 40 characters.';
  const age = Number(input.age);
  if (!/^\d{1,3}$/.test(input.age.trim()) || !Number.isInteger(age)) errors.age = 'Enter your age as a number.';
  else if (age < 18) errors.age = 'Circle40 is for adults 18 and over.';
  else if (age > 99) errors.age = 'Enter an age under 100.';
  if (input.area.trim().length < 2) errors.area = 'Add your neighbourhood, for example Baner.';
  if (input.bio.trim().length > BIO_MAX) errors.bio = `Keep your bio under ${BIO_MAX} characters.`;
  return errors;
}

/** Accepts 24-hour "HH:MM" and returns it zero-padded, or null if invalid. */
export function parseTime(input: string): string | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(input.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return `${h.toString().padStart(2, '0')}:${m[2]}`;
}

export function sortByStart(plans: Plan[]): Plan[] {
  return [...plans].sort((a, b) => parseLocal(a.startsAt).getTime() - parseLocal(b.startsAt).getTime());
}
