import { userSettings } from '@/types.usersettings';
import { addToDateMinutes } from '@/utils/datetime';

const now = new Date();
const nextMonth = new Date(now);
nextMonth.setMonth(now.getMonth() + 1);

export const mockUserSettings: userSettings = {
  saveMode: 'auto',
};

export const mockUser: userType = {
  id: 'mockUserID',
  email: 'mockuser@email.com',
  displayname: 'Mock User',
  settings: mockUserSettings,
};

export const mockContacts: contactType[] = [
  {
    id: 'mockContact1ID',
    name: 'Mock Contact 1',
  },
  {
    id: 'mockContact2ID',
    name: 'Mock Contact 2',
    color: '#ff0000',
  },
  {
    id: 'mockContact3ID',
    name: 'Mock Contact 3',
    comment: 'Fake comment for contact 3',
  },
  {
    id: 'mockContact4ID',
    name: 'Mock Contact 4',
    color: '#00ff00',
    comment: 'Fake comment for contact 4',
  },
];

export const mockContactSimple = mockContacts[0];
export const mockContactFull = mockContacts[3];

export const mockEvents: eventsType[] = [
  {
    id: 'mockEvent1ID',
    title: 'Mock Event 1',
    type: 'single',
    contactId: 'mockContact1ID',
    start: now,
    end: addToDateMinutes(now, 30),
  },
  {
    id: 'mockEvent2ID',
    title: 'Mock Event 2',
    type: 'single',
    contactId: 'mockContact1ID',
    start: addToDateMinutes(now, 24 * 60),
    end: addToDateMinutes(now, 24 * 60 + 60),
    comment: 'Mock comment',
  },
  {
    id: 'mockEvent3ID',
    title: 'Mock Event 3',
    type: 'single',
    contactId: 'mockContact2ID',
    start: addToDateMinutes(now, 2 * 24 * 60),
    end: addToDateMinutes(now, 2 * 24 * 60 + 30),
  },
  {
    id: 'mockEvent4ID',
    title: 'Mock Event 4',
    type: 'recurring',
    contactId: 'mockContact1ID',
    start: now,
    end: addToDateMinutes(now, 30),
    recurrenceData: {
      groupId: null,
      rrule: {
        dtstart: now.toISOString(),
        freq: 'weekly',
        interval: 1,
        byweekday: [1],
        until: nextMonth.toISOString(),
      },
    },
  },
  {
    id: 'mockEvent5ID',
    title: 'Mock Event 5',
    type: 'single',
    start: now,
    allDay: true,
    contactId: 'mockContact1ID',
  },
  {
    id: 'mockEvent6ID',
    title: 'Mock Event 6',
    type: 'single',
    contactId: 'mockContact2ID',
  },
  {
    id: 'mockEvent7ID',
    title: 'Mock Event 7',
    type: 'recurring',
    contactId: 'mockContact1ID',
  },
  {
    id: 'mockEvent8ID',
    title: 'Mock Event 8',
    type: 'recurring',
    contactId: 'mockContact2ID',
    start: now,
    end: addToDateMinutes(now, 30),
    recurrenceData: {
      groupId: 'group-one',
      rrule: {
        dtstart: now.toISOString(),
        freq: 'daily',
        interval: 4,
      },
    },
  },
  {
    id: 'mockEvent9ID',
    title: 'Mock Event 9',
    type: 'recurring',
    contactId: 'mockContact2ID',
    start: addToDateMinutes(now, 60),
    end: addToDateMinutes(now, 90),
    recurrenceData: {
      groupId: 'group-one',
      rrule: {
        dtstart: addToDateMinutes(now, 60).toISOString(),
        freq: 'monthly',
        interval: 2,
        bymonthday: [5, 10],
      },
    },
  },
];

export const mockScheduledEvents = mockEvents.filter((e) => e.start);
export const mockUnscheduledEvents = mockEvents.filter((e) => !e.start);
export const mockEventSimple = mockEvents[0];
export const mockEventWithComment = mockEvents[1];
export const mockEventWithRecurrence = mockEvents[3];
export const mockEventWithAllDay = mockEvents[4];
export const mockEventsWithRecGroup = () => [mockEvents[7], mockEvents[8]];

export const mockLoginResponse: {
  user: any;
  contacts: any[];
  events: any[];
  token?: string | undefined;
} = {
  user: mockUser,
  contacts: mockContacts,
  events: mockEvents,
  token: 'mockToken',
};

export function mockResponse(data: any, error?: string) {
  return {
    data,
    error: error ?? null,
  };
}
