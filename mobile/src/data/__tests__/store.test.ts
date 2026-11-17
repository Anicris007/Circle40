import { beforeEach, describe, expect, it } from '@jest/globals';

import { useAppStore } from '../store';
import { ME_ID } from '../types';

const state = () => useAppStore.getState();
const plan = (id: string) => state().plans.find((p) => p.id === id)!;

beforeEach(() => state().reset());

describe('plans', () => {
  it('joins and leaves a plan', () => {
    state().joinPlan('p3');
    expect(plan('p3').memberIds).toContain(ME_ID);
    state().leavePlan('p3');
    expect(plan('p3').memberIds).not.toContain(ME_ID);
  });

  it('does not join twice', () => {
    state().joinPlan('p3');
    state().joinPlan('p3');
    expect(plan('p3').memberIds.filter((id) => id === ME_ID)).toHaveLength(1);
  });

  it('does not join a full plan', () => {
    const full = state().createPlan({
      title: 'Coffee', category: 'Food', startsAt: '2026-12-01T10:00:00', placeName: 'Café', maxMembers: 2, womenOnly: false,
    });
    useAppStore.setState((s) => ({
      plans: s.plans.map((p) => (p.id === full.id ? { ...p, hostId: 'riya', memberIds: ['riya', 'sana'] } : p)),
    }));
    state().joinPlan(full.id);
    expect(plan(full.id).memberIds).toEqual(['riya', 'sana']);
  });

  it('creates a plan hosted by me, listed first', () => {
    const created = state().createPlan({
      title: 'Momo crawl', category: 'Food', startsAt: '2026-11-23T19:00:00', placeName: 'FC Road', maxMembers: 4, womenOnly: false,
    });
    expect(state().plans[0].id).toBe(created.id);
    expect(created.hostId).toBe(ME_ID);
    expect(created.memberIds).toEqual([ME_ID]);
  });

  it('never lets the host leave their own plan', () => {
    const created = state().createPlan({
      title: 'Trek', category: 'Outdoors', startsAt: '2026-11-23T06:00:00', placeName: 'Depot', maxMembers: 4, womenOnly: false,
    });
    state().leavePlan(created.id);
    expect(plan(created.id).memberIds).toEqual([ME_ID]);
  });
});

describe('chats', () => {
  it('ignores empty messages', () => {
    state().sendGroupMessage('p1', '   ');
    expect(state().groupChats.p1).toHaveLength(2);
  });

  it('starts a chat once and marks replies unread', () => {
    state().startChat('meera', 'Hi!');
    state().startChat('meera', 'Hi again!');
    const chats = state().directChats.filter((c) => c.personId === 'meera');
    expect(chats).toHaveLength(1);
    expect(chats[0].messages).toHaveLength(1);

    state().receiveDirectMessage('meera', 'Hello!');
    expect(state().directChats.find((c) => c.personId === 'meera')!.unread).toBe(true);
    state().markChatRead('meera');
    expect(state().directChats.find((c) => c.personId === 'meera')!.unread).toBe(false);
  });
});

describe('safety', () => {
  it('records a report', () => {
    state().report('person', 'karan', 'romantic_advances');
    expect(state().reports).toHaveLength(1);
    expect(state().reports[0]).toMatchObject({ targetType: 'person', targetId: 'karan', reason: 'romantic_advances' });
  });

  it('blocking removes the chat and records the block', () => {
    state().block('karan');
    expect(state().blockedIds).toEqual(['karan']);
    expect(state().directChats.some((c) => c.personId === 'karan')).toBe(false);
  });
});

describe('profile', () => {
  it('updates name, age, area and bio, trimming spaces', () => {
    state().updateProfile({ name: '  Asha ', lastName: ' Rao ', status: ' Up for brunch ', age: 33, area: ' Aundh ', bio: ' Loves treks. ' });
    expect(state().me).toMatchObject({
      name: 'Asha', lastName: 'Rao', status: 'Up for brunch', age: 33, area: 'Aundh', bio: 'Loves treks.',
    });
    // Other fields are untouched.
    expect(state().me.interests).toEqual(['Movies', 'Brunch', 'Trekking', 'Books']);
    expect(state().me.verified).toBe(true);
  });

  it('clears an emptied last name or status instead of saving blanks', () => {
    state().updateProfile({ name: 'Neha', lastName: '   ', status: '', age: 30, area: 'Baner', bio: '' });
    expect(state().me.lastName).toBeUndefined();
    expect(state().me.status).toBeUndefined();
  });

  it('sets and removes the profile photo', () => {
    state().setPhoto('file:///photo.jpg');
    expect(state().me.photoUri).toBe('file:///photo.jpg');
    state().setPhoto(undefined);
    expect(state().me.photoUri).toBeUndefined();
  });

  it('keeps sign-in details apart from editable profile fields', () => {
    const before = { ...state().account };
    state().updateProfile({ name: 'Asha', age: 33, area: 'Aundh', bio: '' });
    expect(state().account).toEqual(before);
    expect(state().account.phoneVerified).toBe(true);
  });

  it('toggles an interest on and off', () => {
    expect(state().me.interests).not.toContain('Chai');
    state().toggleInterest('Chai');
    expect(state().me.interests).toContain('Chai');
    state().toggleInterest('Chai');
    expect(state().me.interests).not.toContain('Chai');
  });
});
