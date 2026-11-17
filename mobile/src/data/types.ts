/**
 * App data types. Field names match the Supabase tables in
 * supabase/migrations so the sample data can be swapped for real queries later.
 */

export type PlanCategory = 'Food' | 'Outdoors' | 'Games' | 'Movies' | 'Music' | 'Fitness';

export const PLAN_CATEGORIES: PlanCategory[] = ['Food', 'Outdoors', 'Games', 'Movies', 'Music', 'Fitness'];

export const ALL_INTERESTS = [
  'Movies', 'Brunch', 'Trekking', 'Books', 'Board games', 'Live music', 'Cafés',
  'Running', 'Photography', 'Pottery', 'Cycling', 'Football', 'Food walks', 'Chai',
] as const;

export const ME_ID = 'me';

export interface Profile {
  id: string;
  /** First name. Other people see this, plus the last initial. */
  name: string;
  lastName?: string;
  /** Short line under the name, e.g. "Free this weekend". */
  status?: string;
  /** Local image URI from the photo picker. Uploaded to storage in milestone 2. */
  photoUri?: string;
  age: number;
  area: string;
  bio: string;
  interests: string[];
  verified: boolean;
  colorIndex: number;
}

/**
 * Sign-in details for the current user. Read-only in the app: they come from
 * phone sign-in (and email) and can only change through a verified flow.
 */
export interface Account {
  phone: string;
  phoneVerified: boolean;
  email: string;
  emailVerified: boolean;
}

export const STATUS_SUGGESTIONS = [
  'Free this weekend',
  'Up for brunch',
  'Looking for trek buddies',
  'New in town',
  'Weeknights work best',
];

export interface Plan {
  id: string;
  hostId: string;
  title: string;
  category: PlanCategory;
  /** ISO date-time string, e.g. 2026-11-22T05:30:00 */
  startsAt: string;
  placeName: string;
  maxMembers: number;
  womenOnly: boolean;
  memberIds: string[];
}

export interface Message {
  id: string;
  senderId: string;
  body: string;
  sentAt: string;
}

/** A one-to-one conversation, keyed by the other person's id. */
export interface DirectChat {
  personId: string;
  messages: Message[];
  unread: boolean;
}

export type ReportReason =
  | 'romantic_advances'
  | 'unsafe'
  | 'fake_profile'
  | 'spam'
  | 'other';

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'romantic_advances', label: 'Romantic or sexual advances' },
  { value: 'unsafe', label: 'Made me feel unsafe' },
  { value: 'fake_profile', label: 'Fake profile' },
  { value: 'spam', label: 'Spam or selling' },
  { value: 'other', label: 'Something else' },
];

export interface Report {
  id: string;
  targetType: 'person' | 'plan';
  targetId: string;
  reason: ReportReason;
  createdAt: string;
}
