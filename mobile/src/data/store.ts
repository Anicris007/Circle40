/**
 * App state for milestone 1, kept on the device with zustand.
 * Screens read state with `useAppStore(selector)` and change it only through
 * the actions below, so swapping in Supabase later touches this file, not the screens.
 */
import { create } from 'zustand';

import {
  sampleAccount, sampleDirectChats, sampleGroupChats, sampleMe, sampleMeetupCounts, samplePeople, samplePlans,
} from './sample';
import type { Account, DirectChat, Message, Plan, PlanCategory, Profile, Report, ReportReason } from './types';
import { ME_ID } from './types';

export interface NewPlanInput {
  title: string;
  category: PlanCategory;
  startsAt: string;
  placeName: string;
  maxMembers: number;
  womenOnly: boolean;
}

/** The profile fields a person can edit on the Edit profile screen. */
export type ProfileEdit = Pick<Profile, 'name' | 'lastName' | 'status' | 'age' | 'area' | 'bio'>;

export interface AppState {
  me: Profile;
  account: Account;
  people: Profile[];
  plans: Plan[];
  groupChats: Record<string, Message[]>;
  directChats: DirectChat[];
  meetupCounts: Record<string, number>;
  blockedIds: string[];
  reports: Report[];

  joinPlan: (planId: string) => void;
  leavePlan: (planId: string) => void;
  createPlan: (input: NewPlanInput) => Plan;
  sendGroupMessage: (planId: string, body: string) => void;
  startChat: (personId: string, greeting: string) => void;
  sendDirectMessage: (personId: string, body: string) => void;
  receiveDirectMessage: (personId: string, body: string) => void;
  markChatRead: (personId: string) => void;
  toggleInterest: (interest: string) => void;
  updateProfile: (changes: ProfileEdit) => void;
  /** Pass undefined to remove the photo. */
  setPhoto: (uri: string | undefined) => void;
  report: (targetType: Report['targetType'], targetId: string, reason: ReportReason) => void;
  block: (personId: string) => void;
  reset: () => void;
}

let idCounter = 0;
const newId = (prefix: string) => `${prefix}_${Date.now().toString(36)}_${(idCounter++).toString(36)}`;
const now = () => new Date().toISOString();

const initialData = () => ({
  me: { ...sampleMe, interests: [...sampleMe.interests] },
  account: { ...sampleAccount },
  people: samplePeople.map((p) => ({ ...p, interests: [...p.interests] })),
  plans: samplePlans.map((p) => ({ ...p, memberIds: [...p.memberIds] })),
  groupChats: Object.fromEntries(Object.entries(sampleGroupChats).map(([k, v]) => [k, [...v]])),
  directChats: sampleDirectChats.map((c) => ({ ...c, messages: [...c.messages] })),
  meetupCounts: { ...sampleMeetupCounts },
  blockedIds: [] as string[],
  reports: [] as Report[],
});

export const useAppStore = create<AppState>()((set, get) => ({
  ...initialData(),

  joinPlan: (planId) =>
    set((s) => ({
      plans: s.plans.map((p) =>
        p.id === planId && !p.memberIds.includes(ME_ID) && p.memberIds.length < p.maxMembers
          ? { ...p, memberIds: [...p.memberIds, ME_ID] }
          : p,
      ),
    })),

  leavePlan: (planId) =>
    set((s) => ({
      plans: s.plans.map((p) =>
        p.id === planId && p.hostId !== ME_ID
          ? { ...p, memberIds: p.memberIds.filter((id) => id !== ME_ID) }
          : p,
      ),
    })),

  createPlan: (input) => {
    const plan: Plan = { ...input, id: newId('plan'), hostId: ME_ID, memberIds: [ME_ID] };
    set((s) => ({ plans: [plan, ...s.plans] }));
    return plan;
  },

  sendGroupMessage: (planId, body) => {
    const text = body.trim();
    if (!text) return;
    set((s) => ({
      groupChats: {
        ...s.groupChats,
        [planId]: [...(s.groupChats[planId] ?? []), { id: newId('msg'), senderId: ME_ID, body: text, sentAt: now() }],
      },
    }));
  },

  startChat: (personId, greeting) => {
    if (get().directChats.some((c) => c.personId === personId)) return;
    set((s) => ({
      directChats: [
        { personId, unread: false, messages: [{ id: newId('msg'), senderId: ME_ID, body: greeting, sentAt: now() }] },
        ...s.directChats,
      ],
    }));
  },

  sendDirectMessage: (personId, body) => {
    const text = body.trim();
    if (!text) return;
    set((s) => ({
      directChats: s.directChats.map((c) =>
        c.personId === personId
          ? { ...c, messages: [...c.messages, { id: newId('msg'), senderId: ME_ID, body: text, sentAt: now() }] }
          : c,
      ),
    }));
  },

  receiveDirectMessage: (personId, body) =>
    set((s) => ({
      directChats: s.directChats.map((c) =>
        c.personId === personId
          ? { ...c, unread: true, messages: [...c.messages, { id: newId('msg'), senderId: personId, body, sentAt: now() }] }
          : c,
      ),
    })),

  markChatRead: (personId) =>
    set((s) => ({
      directChats: s.directChats.map((c) => (c.personId === personId && c.unread ? { ...c, unread: false } : c)),
    })),

  toggleInterest: (interest) =>
    set((s) => {
      const has = s.me.interests.includes(interest);
      return {
        me: {
          ...s.me,
          interests: has ? s.me.interests.filter((i) => i !== interest) : [...s.me.interests, interest],
        },
      };
    }),

  updateProfile: (changes) =>
    set((s) => ({
      me: {
        ...s.me,
        name: changes.name.trim(),
        lastName: changes.lastName?.trim() || undefined,
        status: changes.status?.trim() || undefined,
        age: changes.age,
        area: changes.area.trim(),
        bio: changes.bio.trim(),
      },
    })),

  setPhoto: (uri) => set((s) => ({ me: { ...s.me, photoUri: uri } })),

  report: (targetType, targetId, reason) =>
    set((s) => ({
      reports: [...s.reports, { id: newId('report'), targetType, targetId, reason, createdAt: now() }],
    })),

  block: (personId) =>
    set((s) => ({
      blockedIds: s.blockedIds.includes(personId) ? s.blockedIds : [...s.blockedIds, personId],
      directChats: s.directChats.filter((c) => c.personId !== personId),
    })),

  reset: () => set(initialData()),
}));
