import { inject, Injectable, signal } from '@angular/core';
import { BookingApi } from '@/services/API/booking.api';
import { addToDateMinutes } from '@/utils/datetime';

type settingsType = Pick<NonNullable<userType['settings']>, 'businessHours' | 'bookingData'> & {
  displayName: userType['displayname'];
};

@Injectable({
  providedIn: 'root',
})
export class Booking {
  private bookingApiService = inject(BookingApi);
  userData = {
    bookingId: signal(''),
    settings: signal<settingsType | null>(null),
    events: signal<eventsType[]>([]),
  };
  private editableEventIds: string[] = [];
  private selectedEventId: string | null = null;

  getEventByID(id: string) {
    return this.userData.events().find((e) => e.id === id);
  }

  getUnscheduledEvents() {
    return this.userData.events().filter((e) => !e.start);
  }

  getSelectedEvent() {
    if (this.selectedEventId == null) return;
    return this.userData.events().find((e) => e.id === this.selectedEventId);
  }

  selectNewEvent(id: string | null) {
    this.selectedEventId = id;
  }

  isEventEditable(id: string) {
    return this.editableEventIds.includes(id);
  }

  hasChangedEvent() {
    return this.editableEventIds.some((id) => this.getEventByID(id)?.start != undefined);
  }

  async readEvents() {
    const response = await this.bookingApiService.readEvents(this.userData.bookingId());
    if (response == null) return false;
    const { settings, events } = response as { settings: settingsType; events: eventsType[] };
    this.userData.settings.set(settings);
    this.userData.events.set(events);
    const id = crypto.randomUUID();
    this.setBookableEvents([id]);
    return true;
  }

  async readEventsForContact(
    contactName: contactType['name'],
    password: NonNullable<contactType['bookingPassword']>,
  ) {
    const response = await this.bookingApiService.readEventsForContact(
      this.userData.bookingId(),
      contactName,
      password,
    );
    return response as { contactId: string; ids: string[] } | null;
  }

  setBookableEvents(ids: string[], contactId = 'BOOKED_EVENTS', title = '<Anonymus>') {
    const events = this.userData.events().filter((e) => !this.isEventEditable(e.id));
    if (ids.length > 0) {
      ids.forEach((id) =>
        events.push({
          id,
          type: 'single',
          contactId,
          title,
        }),
      );
    }
    this.userData.events.set(events);
    this.editableEventIds = ids;
    this.selectNewEvent(ids.length > 0 ? ids[0] : null);
  }

  scheduleEvent(start: Date) {
    const selectedEvent = this.getSelectedEvent();
    if (!selectedEvent) return;
    const duration = this.userData.settings()?.bookingData?.bookingDuration ?? 60;
    const end = addToDateMinutes(start, duration);
    const newData = { ...selectedEvent, start, end } as eventsType;
    this.userData.events.update((prev) =>
      prev.map((e) => (e.id === this.selectedEventId ? newData : e)),
    );
  }

  resetEvents() {
    this.editableEventIds.forEach((id) => {
      const event = this.userData.events().find((e) => e.id === id);
      const newData = { ...event, start: undefined } as eventsType;
      this.userData.events.update((prev) => prev.map((e) => (e.id === id ? newData : e)));
    });
  }

  async bookEvents() {
    const events = this.userData.events();
    const eventsToSubmit = events.filter((e) => this.isEventEditable(e.id) && e.start != undefined);
    eventsToSubmit.forEach((e) => {
      if (e.title === '') e.title = '<Anonymus>';
    });

    const success = await this.bookingApiService.bookEvents(
      this.userData.bookingId(),
      eventsToSubmit,
    );
    if (!success) return false;

    this.selectNewEvent(null);
    const oldEvents = events.filter((e) => !this.isEventEditable(e.id));
    const newEvents = [...oldEvents, ...eventsToSubmit];
    this.editableEventIds = [];
    // this will trigger an update from fullcalendar
    this.userData.events.set(newEvents);

    return true;
  }
}
