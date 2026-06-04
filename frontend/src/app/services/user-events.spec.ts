import { TestBed } from '@angular/core/testing';

import { UserEvents } from './user-events';
import { UserContacts } from '@/services/user-contacts';
import { User } from '@/services/user';
import { Auth } from '@/services/auth';
import { EventApi } from '@/services/API/event.api';
import { contactsSpy, userSpy, authSpy, eventApiSpy } from '@/../test/mockServices';
import { mockEvents, mockEventsWithRecGroup, mockScheduledEvents } from '@/../test/mocks';
import { addToDateMinutes } from '@/utils/datetime';

describe('UserEvents', () => {
  let service: UserEvents;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: UserContacts, useValue: contactsSpy },
        { provide: User, useValue: userSpy },
        { provide: Auth, useValue: authSpy },
        { provide: EventApi, useValue: eventApiSpy },
      ],
    });
    service = TestBed.inject(UserEvents);
    userSpy.currentUserData.events.set([...mockEvents]);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return events stored in userService', () => {
    expect(service.events()).toEqual(mockEvents);
  });

  it('should return all scheduled events', () => {
    const scheduledEvents = service.getAllScheduledEvents();
    const otherEvents = mockEvents.filter((e) => !scheduledEvents.includes(e));

    scheduledEvents.forEach((e) => expect(e.start).toBeTruthy());
    otherEvents.forEach((e) => expect(e.start).toBeFalsy());
  });

  it('should return all scheduled events for given contact', () => {
    const contactID = mockEvents[0].contactId;
    const events = service.getScheduledEventsForContact(contactID);
    const otherEvents = mockEvents.filter((e) => !events.includes(e));

    events.forEach((e) => {
      expect(e.contactId).toBe(contactID);
      expect(e.start).toBeTruthy();
    });
    otherEvents.forEach((e) =>
      expect(e.contactId !== contactID || e.start == undefined).toBe(true),
    );
  });

  it('should return all unscheduled events for given contact', () => {
    const contactID = mockEvents[0].contactId;
    const events = service.getUnscheduledEventsForContact(contactID);
    const otherEvents = mockEvents.filter((e) => !events.includes(e));

    events.forEach((e) => {
      expect(e.contactId).toBe(contactID);
      expect(e.start).toBeFalsy();
    });
    otherEvents.forEach((e) =>
      expect(e.contactId !== contactID || e.start != undefined).toBe(true),
    );
  });

  it('should return an event by ID', () => {
    const randomIndex = Math.round(Math.random() * (mockEvents.length - 1));
    const event = mockEvents[randomIndex];

    expect(service.getEventByID(event.id)).toEqual(event);
  });

  it('should unpack recurrent events into multiple instances if recurrence data specifies composite pattern', () => {
    // 2000. febr. 1 is a Tuesday, which means a value of 1 in 'byweekday' array
    const complexEvents: eventsType[] = [
      {
        id: 'ID1',
        title: 'Title 1',
        type: 'single',
        contactId: 'contactID',
        start: new Date(2000, 1, 1, 10, 15),
        end: new Date(2000, 1, 1, 11, 0),
      },
      {
        id: 'ID2',
        title: 'Title 2',
        type: 'recurring',
        contactId: 'contactID',
        start: new Date(2000, 1, 1, 10, 15),
        end: new Date(2000, 1, 1, 11, 0),
        recurrenceData: {
          groupId: null,
          rrule: {
            dtstart: new Date(2000, 1, 1, 10, 15).toISOString(),
            freq: 'weekly',
            interval: 1,
            byweekday: [2, 5, 6],
          },
        },
      },
      {
        id: 'ID3',
        title: 'Title 3',
        type: 'recurring',
        contactId: 'contactID',
        start: new Date(2000, 1, 1, 10, 15),
        end: new Date(2000, 1, 1, 11, 0),
        recurrenceData: {
          groupId: null,
          rrule: {
            dtstart: new Date(2000, 1, 1, 10, 15).toISOString(),
            freq: 'monthly',
            interval: 1,
            bymonthday: [9, 15, 23, 28],
          },
        },
      },
    ];
    // recurrence data is omitted for brevity and not tested but in the current implementation it is there unchanged
    const expectedEvents: eventsType[] = [
      {
        id: 'ID1',
        title: 'Title 1',
        type: 'single',
        contactId: 'contactID',
        start: new Date(2000, 1, 1, 10, 15),
        end: new Date(2000, 1, 1, 11, 0),
      },
      {
        id: 'ID2',
        title: 'Title 2',
        type: 'recurring',
        contactId: 'contactID',
        start: new Date(2000, 1, 2, 10, 15),
        end: new Date(2000, 1, 2, 11, 0),
      },
      {
        id: 'ID2',
        title: 'Title 2',
        type: 'recurring',
        contactId: 'contactID',
        start: new Date(2000, 1, 5, 10, 15),
        end: new Date(2000, 1, 5, 11, 0),
      },
      {
        id: 'ID2',
        title: 'Title 2',
        type: 'recurring',
        contactId: 'contactID',
        start: new Date(2000, 1, 6, 10, 15),
        end: new Date(2000, 1, 6, 11, 0),
      },
      {
        id: 'ID3',
        title: 'Title 3',
        type: 'recurring',
        contactId: 'contactID',
        start: new Date(2000, 1, 9, 10, 15),
        end: new Date(2000, 1, 9, 11, 0),
      },
      {
        id: 'ID3',
        title: 'Title 3',
        type: 'recurring',
        contactId: 'contactID',
        start: new Date(2000, 1, 15, 10, 15),
        end: new Date(2000, 1, 15, 11, 0),
      },
      {
        id: 'ID3',
        title: 'Title 3',
        type: 'recurring',
        contactId: 'contactID',
        start: new Date(2000, 1, 23, 10, 15),
        end: new Date(2000, 1, 23, 11, 0),
      },
      {
        id: 'ID3',
        title: 'Title 3',
        type: 'recurring',
        contactId: 'contactID',
        start: new Date(2000, 1, 28, 10, 15),
        end: new Date(2000, 1, 28, 11, 0),
      },
    ];
    userSpy.currentUserData.events.set(complexEvents);

    const unpackedEvents = service.getUnpackedEvents();

    unpackedEvents.forEach((e, i) => expect(e).toEqual(expect.objectContaining(expectedEvents[i])));
  });

  it('should return the contact object for given event', () => {
    const event: eventsType = {
      id: 'ID',
      title: 'title',
      type: 'single',
      contactId: 'UniqueMockContactID',
    };
    userSpy.currentUserData.events.set([...mockEvents, event]);

    service.getContactForEvent(event.id);

    expect(contactsSpy.getContactByID).toHaveBeenCalledWith(event.contactId);
  });

  it.each([
    [1, false],
    [3, false],
    [1, true],
    [3, true],
  ])('should add %s new event(s) and shouldSaveToServer is %s', (num, toServer) => {
    authSpy.canAutosaveToServer.mockReturnValueOnce(toServer);
    const newEvent: eventsType = {
      id: 'newEventID',
      title: 'New Event Title',
      type: 'single',
      contactId: 'MockContactID',
    };
    const expectedEvent = {
      id: expect.any(String),
      title: 'New Event Title',
      type: 'single',
      contactId: expect.any(String),
    };
    const eventExpectation = new Array(num).fill(expect.objectContaining(expectedEvent));

    service.addEvent(newEvent, num);

    expect(service.events()).toEqual(expect.arrayContaining(new Array(num).fill(expectedEvent)));
    if (toServer) expect(eventApiSpy.createEvents).toHaveBeenCalledWith(eventExpectation);
    else expect(eventApiSpy.createEvents).not.toHaveBeenCalled();
  });

  it.each([false, true])('should remove an event and shouldSaveToServer is %s', (toServer) => {
    authSpy.canAutosaveToServer.mockReturnValueOnce(toServer);
    const randomIndex = Math.round(Math.random() * (mockEvents.length - 1));
    const event = mockEvents[randomIndex];

    service.removeEvent(event.id);

    expect(service.events()).not.toContainEqual(event);
    if (toServer) expect(eventApiSpy.deleteEvents).toHaveBeenCalledWith([event.id]);
    else expect(eventApiSpy.deleteEvents).not.toHaveBeenCalled();
  });

  it.each([false, true])('should remove events and shouldSaveToServer is %s', (toServer) => {
    authSpy.canAutosaveToServer.mockReturnValueOnce(toServer);
    const events = mockEvents.slice(1, 4);

    service.removeEvents(events.map((e) => e.id));

    events.forEach((e) => expect(service.events()).not.toContainEqual(e));
    if (toServer) expect(eventApiSpy.deleteEvents).toHaveBeenCalledWith(events.map((e) => e.id));
    else expect(eventApiSpy.deleteEvents).not.toHaveBeenCalled();
  });

  it.each([false, true])('should update an event and shouldSaveToServer is %s', (toServer) => {
    authSpy.canAutosaveToServer.mockReturnValueOnce(toServer);
    const updatedEvent: Partial<eventsType> = {
      id: mockEvents[0].id,
      allDay: true,
      title: 'Updated Title',
      start: undefined,
    };

    service.editEvent(updatedEvent.id!, updatedEvent);

    expect(service.events()[0]).toEqual(expect.objectContaining(updatedEvent));
    if (toServer) expect(eventApiSpy.updateEvents).toHaveBeenCalledWith([updatedEvent]);
    else expect(eventApiSpy.updateEvents).not.toHaveBeenCalled();
  });

  it.each([false, true])('should update events and shouldSaveToServer is %s', (toServer) => {
    authSpy.canAutosaveToServer.mockReturnValueOnce(toServer);
    const updatedEvents: Partial<eventsType>[] = [
      {
        id: mockEvents[0].id,
        allDay: true,
        title: 'Updated Title',
        start: undefined,
      },
      {
        id: mockEvents[1].id,
        comment: 'Updated Coment',
        type: 'recurring',
        title: 'Updated Title 2',
        recurrenceData: {
          groupId: null,
          rrule: {
            dtstart: 'dstart',
            interval: 1,
            freq: 'weekly',
          },
        },
      },
    ];

    service.editEvents(updatedEvents.map((e) => ({ eventId: e.id!, newData: e })));

    expect(service.events()[0]).toEqual(expect.objectContaining(updatedEvents[0]));
    expect(service.events()[1]).toEqual(expect.objectContaining(updatedEvents[1]));
    if (toServer) expect(eventApiSpy.updateEvents).toHaveBeenCalledWith(updatedEvents);
    else expect(eventApiSpy.updateEvents).not.toHaveBeenCalled();
  });

  it('should reschedule events (simple)', () => {
    const event = mockScheduledEvents[0];
    const newStartDate = addToDateMinutes(event.start!, 1000);
    const newEndDate = addToDateMinutes(event.end!, 1000);

    service.rescheduleEvent(event.id, event.start!, newStartDate);
    const eventToInspect = service.events().find((e) => e.id === event.id);

    expect(eventToInspect?.start?.getTime()).toBe(newStartDate.getTime());
    expect(eventToInspect?.end?.getTime()).toBe(newEndDate.getTime());
  });

  it('should reschedule events (grouped)', () => {
    const events = mockEventsWithRecGroup();
    const newStartDates = events.map((e) => addToDateMinutes(e.start!, 24 * 60));
    const newEndDates = events.map((e) => addToDateMinutes(e.end!, 24 * 60));
    const newWeekdayRules = events.map((e) =>
      e.recurrenceData?.rrule.byweekday?.map((w) => (w + 1 < 7 ? w + 1 : 0)),
    );

    service.rescheduleEvent(events[0].id, events[0].start!, newStartDates[0]);
    const eventsToInspect = service.events().filter((e) => events.map((e) => e.id).includes(e.id));

    eventsToInspect.forEach((e, i) => {
      expect(e.start?.getTime()).toBe(newStartDates[i].getTime());
      expect(e.end?.getTime()).toBe(newEndDates[i].getTime());
      expect(e.recurrenceData?.rrule.byweekday).toEqual(newWeekdayRules[i]);
    });
  });

  it('should open the context menu for event element', () => {
    const id = mockEvents[0].id;
    const currentlyOpenEventspy = vi.spyOn(service.eventWithContextMenuOpen.current, 'set');

    service.openContextMenuForEvent(id, 5, 5);

    expect(currentlyOpenEventspy).toHaveBeenCalledWith(id);
    expect(service.contextMenuPosition).toEqual({ x: 5, y: 5 });
  });

  afterAll(() => {
    userSpy.currentUserData.events.set([]);
  });
});
