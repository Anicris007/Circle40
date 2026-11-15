/**
 * Example data for milestone 1. These people and plans are made up and only
 * exist on the device. Milestone 2 replaces them with Supabase queries.
 */
import type { DirectChat, Message, Plan, Profile } from './types';
import { ME_ID } from './types';

export const sampleMe: Profile = {
  id: ME_ID,
  name: 'You',
  age: 30,
  area: 'Baner',
  bio: 'Looking for friends to go out with.',
  interests: ['Movies', 'Brunch', 'Trekking', 'Books'],
  verified: true,
  colorIndex: 5,
};

export const samplePeople: Profile[] = [
  { id: 'riya', name: 'Riya', age: 29, area: 'Baner', verified: true, colorIndex: 0,
    bio: 'My sister and my last single friend both got married this year. Looking for brunch and bookshop people.',
    interests: ['Books', 'Brunch', 'Pottery'] },
  { id: 'karan', name: 'Karan', age: 31, area: 'Kothrud', verified: true, colorIndex: 1,
    bio: 'Weekend trekker. My trek group turned into a couples group. Need new trail buddies.',
    interests: ['Trekking', 'Cycling', 'Chai'] },
  { id: 'meera', name: 'Meera', age: 34, area: 'Aundh', verified: true, colorIndex: 2,
    bio: 'I work from home, so weekdays are quiet. Into board games, live music and new cafés.',
    interests: ['Board games', 'Live music', 'Cafés'] },
  { id: 'arjun', name: 'Arjun', age: 27, area: 'Viman Nagar', verified: true, colorIndex: 3,
    bio: 'Moved here for work six months ago and know nobody yet. Happy to join anything.',
    interests: ['Movies', 'Football', 'Food walks'] },
  { id: 'sana', name: 'Sana', age: 30, area: 'Koregaon Park', verified: true, colorIndex: 4,
    bio: 'Runner and amateur photographer. Would love a Sunday-morning crew.',
    interests: ['Running', 'Photography', 'Brunch'] },
];

export const samplePlans: Plan[] = [
  { id: 'p1', hostId: 'riya', title: 'Sunday brunch at a new café in Baner', category: 'Food',
    startsAt: '2026-11-22T11:00:00', placeName: 'Baner Road', maxMembers: 4, womenOnly: true,
    memberIds: ['riya', 'sana'] },
  { id: 'p2', hostId: 'karan', title: 'Sinhagad sunrise trek', category: 'Outdoors',
    startsAt: '2026-11-29T05:30:00', placeName: 'Meet at Kothrud depot', maxMembers: 6, womenOnly: false,
    memberIds: ['karan', 'arjun', 'sana'] },
  { id: 'p3', hostId: 'meera', title: 'Board game night, beginners welcome', category: 'Games',
    startsAt: '2026-11-19T19:30:00', placeName: 'Dice café, Aundh', maxMembers: 5, womenOnly: false,
    memberIds: ['meera'] },
  { id: 'p4', hostId: 'arjun', title: "Evening show, whatever's new this Friday", category: 'Movies',
    startsAt: '2026-11-21T21:00:00', placeName: 'Phoenix Mall', maxMembers: 4, womenOnly: false,
    memberIds: ['arjun', 'meera'] },
];

const msg = (id: string, senderId: string, body: string, sentAt: string): Message => ({ id, senderId, body, sentAt });

export const sampleGroupChats: Record<string, Message[]> = {
  p1: [
    msg('g1', 'riya', 'Booked a table for 4 by the window.', '2026-11-15T09:10:00'),
    msg('g2', 'sana', 'Perfect, see you there!', '2026-11-15T09:12:00'),
  ],
  p2: [
    msg('g3', 'karan', "Bring a torch and a light jacket. It's cold at the top.", '2026-11-14T20:00:00'),
    msg('g4', 'sana', "I'll bring my camera for the sunrise!", '2026-11-14T20:05:00'),
  ],
};

export const sampleDirectChats: DirectChat[] = [
  { personId: 'riya', unread: true, messages: [
    msg('d1', 'riya', 'Hi! Saw you also like bookshops. Have you been to the one near FC Road?', '2026-11-15T08:30:00'),
  ] },
  { personId: 'karan', unread: true, messages: [
    msg('d2', ME_ID, 'Is the trek okay for a first-timer?', '2026-11-14T18:00:00'),
    msg('d3', 'karan', "Totally. It's 2 hours up and we go slow. Bring water and a torch.", '2026-11-14T18:04:00'),
  ] },
];

/** How many times you have met each person. Two or more makes them a regular. */
export const sampleMeetupCounts: Record<string, number> = { sana: 3, meera: 2, karan: 1 };
