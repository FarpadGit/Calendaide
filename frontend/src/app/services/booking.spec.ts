import { TestBed } from '@angular/core/testing';

import { Booking } from './booking';
import { mockEvents, mockUnscheduledEvents, mockUser, mockUserSettings } from '../../test/mocks';
import { BookingApi } from './API/booking.api';
import { bookingApiSpy } from '../../test/mockServices';
import { addToDateMinutes } from '@/utils/datetime';

describe('Booking', () => {
  let service: Booking;
  const mockSettings = {
    displayName: mockUser.displayname,
    bookingData: { ...mockUserSettings.bookingData, bookingDuration: 100 },
    businessHours: mockUserSettings.businessHours,
  };
  const editableEventIds = ['fakeID1', 'fakeID2', 'fakeID3'];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: BookingApi, useValue: bookingApiSpy }],
    });
    service = TestBed.inject(Booking);
    service.userData.events.set([...mockEvents]);
    service.userData.settings.set(mockSettings);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return an event by ID', () => {
    const randomIndex = Math.round(Math.random() * (mockEvents.length - 1));
    const event = mockEvents[randomIndex];

    expect(service.getEventByID(event.id)).toEqual(event);
  });

  it('should return all unscheduled events', () => {
    const events = service.getUnscheduledEvents();
    const otherEvents = mockEvents.filter((e) => !events.includes(e));

    events.forEach((e) => expect(e.start).toBeFalsy());
    otherEvents.forEach((e) => expect(e.start).toBeDefined());
  });

  it('should return the currently selected event', () => {
    expect(service.getSelectedEvent()).toBeUndefined();

    const selectedEvent = mockEvents[3];
    service.selectNewEvent(selectedEvent.id);

    expect(service.getSelectedEvent()).toBe(selectedEvent);
  });

  it.each([true, false])(
    "should read the user's scheduled events from the server and add 1 unscheduled event (success: %s)",
    async (success) => {
      service.userData.events.set([]);
      service.userData.settings.set(null);

      const serverResponse = success ? { settings: mockSettings, events: mockEvents } : null;
      bookingApiSpy.readEvents.mockResolvedValueOnce(serverResponse);

      const result = await service.readEvents();

      expect(result).toBe(success);
      if (success) {
        expect(service.userData.settings()).toEqual(mockSettings);
        const readEvents = [...service.userData.events()];
        const newEvent = readEvents.pop();
        expect(readEvents).toEqual(mockEvents);
        expect(newEvent).toBeTruthy();
        expect(service.isEventEditable(newEvent!.id)).toBe(true);
        expect(service.getSelectedEvent()).toBe(newEvent);
      }
    },
  );

  it("should read the user's unscheduled events for a given contact", async () => {
    const mockResponse = { contactId: 'fakeContactID', ids: ['fakeEventID1', 'fakeEventID2'] };
    bookingApiSpy.readEventsForContact.mockResolvedValueOnce(mockResponse);

    const result = await service.readEventsForContact('fakeContactName', 'fakeContactPassword');

    expect(result).toEqual(mockResponse);
  });

  it('should set the collection of editable events the user can drag onto the calendar', () => {
    const newExpectedEvents = editableEventIds.map((id) => expect.objectContaining({ id }));

    service.setBookableEvents(editableEventIds);

    expect(service.userData.events()).toEqual([...mockEvents, ...newExpectedEvents]);
    editableEventIds.forEach((id) => expect(service.isEventEditable(id)).toBe(true));
    expect(service.getSelectedEvent()?.id).toBe(editableEventIds[0]);
  });

  it('should schedule the start date of the currently selected event', () => {
    const newStart = new Date();
    const mockEvent = { ...mockUnscheduledEvents[0] };
    service.setBookableEvents([mockEvent.id]);
    expect(service.hasChangedEvent()).toBe(false);

    service.selectNewEvent(mockEvent.id);
    service.scheduleEvent(newStart);

    expect(service.getSelectedEvent()?.start).toEqual(newStart);
    expect(service.getSelectedEvent()?.end).toEqual(
      addToDateMinutes(newStart, mockSettings.bookingData.bookingDuration),
    );
    expect(service.hasChangedEvent()).toBe(true);
  });

  it('should reset all editable events with unset start dates', () => {
    service.setBookableEvents(editableEventIds);
    editableEventIds.forEach((id) => {
      service.selectNewEvent(id);
      service.scheduleEvent(new Date());
    });
    editableEventIds.forEach((id) => expect(service.getEventByID(id)?.start).toBeDefined());

    service.resetEvents();

    editableEventIds.forEach((id) => expect(service.getEventByID(id)?.start).toBeUndefined());
    expect(service.hasChangedEvent()).toBe(false);
  });

  it.each([true, false])(
    'should book new appointments and unset and unselect all editable events (success: %s)',
    async (success) => {
      service.setBookableEvents(editableEventIds);
      bookingApiSpy.bookEvents.mockResolvedValueOnce(success);

      const result = await service.bookEvents();

      expect(result).toBe(success);
      if (success) {
        expect(service.getSelectedEvent()).toBeUndefined();
        editableEventIds.forEach((id) => expect(service.isEventEditable(id)).toBe(false));
      }
    },
  );
});
