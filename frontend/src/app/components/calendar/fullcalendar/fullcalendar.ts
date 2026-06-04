import { Component, effect, EventEmitter, inject, Output, ViewChild } from '@angular/core';
import { User } from '@/services/user';
import { UserEvents } from '@/services/user-events';
import { CalendarEventContent } from '@/components/calendar/calendar-event-content/calendar-event-content';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import { EventImpl } from '@fullcalendar/core/internal';
import hu from '@fullcalendar/core/locales/hu';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import rrulePlugin from '@fullcalendar/rrule';
import { addToDateMinutes, getDuration } from '@/utils/datetime';
import { defaultEventColor } from '@/utils/shared';

@Component({
  selector: 'app-fullcalendar',
  imports: [FullCalendarModule, CalendarEventContent],
  templateUrl: './fullcalendar.html',
  styleUrl: './fullcalendar.scss',
})
export class Fullcalendar {
  @ViewChild('calendar') private calendar: FullCalendarComponent | undefined;
  @Output() onDateSelect: EventEmitter<Date> = new EventEmitter();
  private userService = inject(User);
  private eventsService = inject(UserEvents);

  private selectedDate?: string;
  defaultEventColor = defaultEventColor;

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    editable: true,
    droppable: true,
    eventStartEditable: true,
    eventDurationEditable: true,
    locale: hu,
    headerToolbar: {
      start: 'prev,next today',
      center: 'title',
      end: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    buttonText: {
      // changing default casing of localized button text
      day: 'nap',
      week: 'hét',
      month: 'hónap',
      today: 'Ma',
    },
    contentHeight: '100vh',
    dateClick: (arg) => this.handleDateClick(arg.date),
    events: (_, success) => {
      this.calendar?.getApi()?.removeAllEvents();
      const allScheduledEvents = this.eventsService.getAllScheduledEvents().map((e) => {
        // fullcalendar's groupId is converted into the string 'undefined' if undefined, so we must pass an empty string instead
        return {
          ...e,
          duration: e.allDay ? undefined : { minutes: getDuration(e.start, e.end) },
          groupId: e.recurrenceData?.groupId ?? '',
          rrule: e.recurrenceData?.rrule,
        } as EventInput;
      });

      return success(allScheduledEvents);
    },
    eventDisplay: 'block',
    snapDuration: '00:15:00',
    eventReceive: (arg) => {
      arg.revert();
      this.eventsService.editEvent(arg.event.id, {
        start: arg.event.start ?? undefined,
        end: arg.event.end ?? undefined,
        allDay: arg.event.allDay,
      });
      this.updateCalendar();
    },
    eventDragStart: (arg) => {
      this.eventsService.eventBeingDragged.set(arg.event.id);
    },
    eventDragStop: (arg) => {
      this.eventsService.eventBeingDragged.set(null);
    },
    eventResize: (arg) => {
      const event = this.asEventsType(arg.event);
      this.eventsService.editEvent(arg.event.id, event);
      if (event.type === 'recurring') this.updateCalendar();
    },
    eventDrop: (arg) => {
      if (!arg.event.start || !arg.oldEvent.start) return;
      const event = this.asEventsType(arg.event);

      if (arg.oldEvent.allDay !== arg.event.allDay) {
        if (event.recurrenceData)
          event.recurrenceData.rrule.dtstart = arg.event.start.toISOString();
        this.eventsService.editEvent(arg.event.id, event);
      } else {
        this.eventsService.rescheduleEvent(arg.event.id, arg.oldEvent.start, arg.event.start);
      }

      if (event.recurrenceData) this.updateCalendar();
    },
    eventClassNames: (arg) =>
      arg.event.extendedProps['context-menu-open'] ? 'context-menu-open' : '',
    viewDidMount: (arg) => {
      this.selectedDate = undefined;
      if (arg.view.type === 'dayGridMonth') arg.view.calendar.setOption('height', undefined);
      else arg.view.calendar.setOption('height', 'auto');
    },
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, rrulePlugin],
  };

  constructor() {
    effect(() => {
      const user = this.userService.currentUserData.user();
      if (user) this.updateCalendar();
    });

    effect(() => {
      const current = this.eventsService.eventWithContextMenuOpen.current();
      const prev = this.eventsService.eventWithContextMenuOpen.previous();
      const calendar = this.calendar?.getApi();

      calendar?.getEventById(prev ?? '')?.setExtendedProp('context-menu-open', false);
      calendar?.getEventById(current ?? '')?.setExtendedProp('context-menu-open', true);
    });
  }

  handleDateClick(date: Date, forceView: boolean = false) {
    const calendar = this.calendar?.getApi();
    if (!calendar) return;
    if (calendar.view.type === 'timeGridDay' && !forceView) return;

    if (this.selectedDate !== date.toISOString()) {
      this.selectedDate = date.toISOString();
      let selectEnd;
      if (calendar.view.type === 'timeGridWeek') selectEnd = addToDateMinutes(date, 2 * 60);
      if (forceView && calendar.view.type !== 'dayGridMonth')
        calendar.changeView('dayGridMonth', date);
      calendar.select(date, selectEnd);
    } else if (!forceView) calendar.changeView('timeGridDay', date);

    this.onDateSelect.emit(date);
  }

  handleEventContextMenu({ eventId, x, y }: { eventId: string; x: number; y: number }) {
    this.eventsService.openContextMenuForEvent(eventId, x, y);
  }

  handleEventRemove(eventId: string) {
    this.calendar?.getApi().getEventById(eventId)?.remove();
  }

  updateCalendar(options?: { eventId?: string; contactId?: string }) {
    const calendar = this.calendar?.getApi();
    const { eventId, contactId } = options ?? {};
    if (eventId) {
      this.updateEvent(eventId);
    } else if (contactId) {
      const events = this.eventsService.getScheduledEventsForContact(contactId);
      events.forEach((event) => this.updateEvent(event.id));
    } else {
      calendar?.removeAllEvents();
      calendar?.refetchEvents();
    }
  }

  private updateEvent(eventId: string) {
    const event = this.eventsService.getEventByID(eventId);
    if (!event) return;

    const calendar = this.calendar?.getApi();
    calendar?.getEventById(eventId)?.remove();
    calendar?.addEvent({
      id: event.id,
      title: event.title,
      allDay: event.allDay,
      start: event.start,
      end: event.end,
      groupId: event.recurrenceData?.groupId ?? '',
      rrule: event.recurrenceData?.rrule,
      extendedProps: { comment: event.comment },
    });
  }

  asEventsType(fullcalendarEvent: EventImpl) {
    const event = this.eventsService.getEventByID(fullcalendarEvent.id);

    return {
      ...event,
      allDay: fullcalendarEvent.allDay ?? false,
      start: fullcalendarEvent.start,
      end: fullcalendarEvent.end,
    } as eventsType;
  }

  getContactForEvent(eventId: string) {
    return this.eventsService.getContactForEvent(eventId) ?? undefined;
  }
}
