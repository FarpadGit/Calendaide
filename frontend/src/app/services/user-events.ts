import { inject, Injectable, signal } from '@angular/core';
import { UserContacts } from '@/services/user-contacts';
import { User } from '@/services/user';
import { Auth } from '@/services/auth';
import { EventApi } from '@/services/API/event.api';
import { computedPrevious } from '@/utils/computed';
import { timeDelta, addToDateMS, addToDateMinutes, getDuration } from '@/utils/datetime';
import { mod, getObjectDiff } from '@/utils/shared';

@Injectable({
  providedIn: 'root',
})
export class UserEvents {
  private contactsService = inject(UserContacts);
  private userService = inject(User);
  private authService = inject(Auth);
  private apiService = inject(EventApi);
  eventWithContextMenuOpen = computedPrevious<string | null>();
  contextMenuPosition: { x: number; y: number } = { x: 0, y: 0 };
  eventWithEditMenuOpen = signal<string | null>(null);
  eventBeingDragged = signal<string | null>(null);

  get events() {
    return this.userService.currentUserData.events;
  }

  getEventsForCurrentUser() {
    return this.events();
  }

  getAllScheduledEvents() {
    return this.events().filter((e) => e.start != undefined);
  }

  getScheduledEventsForContact(contactId: string) {
    return this.events().filter((e) => e.contactId === contactId && e.start != undefined);
  }

  getUnscheduledEventsForContact(contactId: string) {
    return this.events().filter((e) => e.contactId === contactId && e.start == undefined);
  }

  getEventByID(eventId: string) {
    return this.events().find((e) => e.id === eventId);
  }

  // maps recurrent events with complex rrules into seperate event instances
  // (e.g. an event that happens every tuesday and sunday becomes two events)
  getUnpackedEvents() {
    return this.events().reduce<eventsType[]>((prev, e) => {
      if (!e.recurrenceData) return [...prev, e];

      const toInstance = (startDate: Date, dayOffset: number) => {
        const start = addToDateMinutes(startDate, dayOffset * 24 * 60);
        let end = undefined;
        if (e.end) {
          const duration = getDuration(e.start, e.end);
          end = addToDateMinutes(start, duration);
        }
        return { ...e, start, end } as eventsType;
      };

      if (e.recurrenceData.rrule.byweekday) {
        // if recurrence is weekly, we shift back the event date to the beginning of that week, add the weekdays in rrule
        // and map each of those dates to an event instance
        const weekStartDay = new Date(e.start!);
        const delta = mod(e.start!.getDay() - 1, 7);
        weekStartDay.setDate(weekStartDay.getDate() - delta);
        const events = e.recurrenceData.rrule.byweekday.map((weekday) =>
          toInstance(weekStartDay, weekday),
        );
        return [...prev, ...events];
      }
      if (e.recurrenceData.rrule.bymonthday) {
        // if recurrence is monthly, same logic applies but with the first day of the month
        const monthStartDay = new Date(e.start!);
        monthStartDay.setDate(0);
        const events = e.recurrenceData.rrule.bymonthday.map((day) =>
          toInstance(monthStartDay, day),
        );
        return [...prev, ...events];
      }

      return [...prev, e];
    }, []);
  }

  getContactForEvent(eventId: string) {
    const event = this.events().find((e) => e.id === eventId);
    if (!event) return null;
    return this.contactsService.getContactByID(event.contactId);
  }

  addEvent(newEvent: Omit<eventsType, 'id' | 'contactId'>, count: number = 1) {
    const currentContact = this.contactsService.getActiveContact();
    if (!currentContact) return;
    const newEvents: eventsType[] = [];

    for (let i = 0; i < count; i++) {
      newEvents.push({ ...newEvent, id: crypto.randomUUID(), contactId: currentContact.id });
    }

    this.events.update((prev) => [...prev, ...newEvents]);

    if (this.authService.canAutosaveToServer()) {
      this.apiService.createEvents(newEvents);
    }
  }

  removeEvent(eventId: string) {
    this.removeEvents([eventId]);
  }

  removeEvents(eventIds: string[]) {
    this.events.update((prev) => prev.filter((e) => !eventIds.includes(e.id)));

    if (this.authService.canAutosaveToServer()) {
      this.apiService.deleteEvents(eventIds);
    }
  }

  editEvent(eventId: string, newData: Partial<eventsType>) {
    this.editEvents([{ eventId, newData }]);
  }

  editEvents(events: { eventId: string; newData: Partial<eventsType> }[]) {
    const editedEvents: Partial<eventsType>[] = [];

    events.forEach(({ eventId, newData }) => {
      const event = this.getEventByID(eventId);
      if (!event) return;

      const _newData = { ...newData };
      delete _newData.id;
      delete _newData.contactId;
      const editedEvent = { ...event, ..._newData };

      if (editedEvent.type !== 'recurring') editedEvent.recurrenceData = undefined;
      const diff = getObjectDiff(event, editedEvent);
      if (diff) editedEvents.push({ id: eventId, ...diff });

      this.events.update((prev) => prev.map((e) => (e.id !== eventId ? e : editedEvent)));
    });

    if (this.authService.canAutosaveToServer()) {
      this.apiService.updateEvents(editedEvents);
    }
  }

  rescheduleEvent(eventId: string, oldDate: Date, newDate: Date) {
    const event = this.getEventByID(eventId);
    if (!event) return;

    const delta = timeDelta(newDate, oldDate);

    if (!event.recurrenceData) {
      const newEndDate = event.end ? addToDateMS(event.end, delta) : undefined;
      this.editEvent(eventId, { start: newDate, end: newEndDate });
      return;
    }

    const oneDay = 24 * 60 * 60 * 1000;
    const deltaDays = Math.trunc(delta / oneDay);

    const groupedEvents = this.events().filter(
      (e) =>
        e.id !== event.id &&
        !!e.recurrenceData?.groupId &&
        e.recurrenceData.groupId === event.recurrenceData!.groupId,
    );
    groupedEvents.push(event);

    const eventsToUpdate = groupedEvents
      .map((groupEvent) => {
        if (!groupEvent.recurrenceData) return;
        const newEventData = { ...groupEvent };

        // event start time is shifted by how much the user dragged the element (all-day events are shifted to the nearest day)
        const correctedDelta = groupEvent.allDay ? deltaDays * oneDay : delta;
        if (groupEvent.start) newEventData.start = addToDateMS(groupEvent.start, correctedDelta);
        if (groupEvent.end) newEventData.end = addToDateMS(groupEvent.end, correctedDelta);

        let byweekday = groupEvent.recurrenceData.rrule.byweekday;
        let bymonthday = groupEvent.recurrenceData.rrule.bymonthday;

        // recursion rules are also shifted
        const dtstart = newEventData.start!.toISOString();

        if (Math.abs(deltaDays) >= 1) {
          if (groupEvent.recurrenceData.rrule.byweekday) {
            byweekday = groupEvent.recurrenceData.rrule.byweekday.map((d) => mod(d + deltaDays, 7));
          }
          if (groupEvent.recurrenceData.rrule.bymonthday) {
            const currentMonth = new Date(oldDate);
            currentMonth.setDate(0);
            bymonthday = groupEvent.recurrenceData.rrule.bymonthday.map((d) => {
              const date = addToDateMS(currentMonth, d * oneDay);
              const newDate = addToDateMS(date, correctedDelta);
              return newDate.getDate();
            });
          }
        }

        newEventData.recurrenceData = {
          ...groupEvent.recurrenceData,
          rrule: {
            ...groupEvent.recurrenceData!.rrule,
            dtstart,
            byweekday,
            bymonthday,
          },
        };

        return { eventId: groupEvent.id, newData: newEventData };
      })
      .filter((e) => e !== undefined);

    this.editEvents(eventsToUpdate);
  }

  openContextMenuForEvent(eventId: string, x: number, y: number) {
    this.contextMenuPosition = { x, y };
    this.eventWithContextMenuOpen.current.set(eventId);
  }
}
