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
