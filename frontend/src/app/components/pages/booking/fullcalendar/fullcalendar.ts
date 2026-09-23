import { Component, effect, EventEmitter, inject, Output, ViewChild } from '@angular/core';
import { Booking } from '@/services/booking';
import { CalendarEventContent } from '@/components/calendar/calendar-event-content/calendar-event-content';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import { EventImpl } from '@fullcalendar/core/internal';
import hu from '@fullcalendar/core/locales/hu';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import rrulePlugin from '@fullcalendar/rrule';
import { getDuration } from '@/utils/datetime';

@Component({
  selector: 'app-fullcalendar',
  imports: [FullCalendarModule, CalendarEventContent],
  templateUrl: './fullcalendar.html',
  styleUrl: './fullcalendar.scss',
})
export class Fullcalendar {
  @ViewChild('calendar') private calendar: FullCalendarComponent | undefined;
  @Output() onNewEventSelect = new EventEmitter<string>();
  private bookingService = inject(Booking);

  calendarOptions: CalendarOptions = {
    initialView: 'bookingView',
    editable: true,
    droppable: true,
    eventOverlap: false,
    eventStartEditable: false,
    eventDurationEditable: false,
    locale: hu,
    headerToolbar: {
      start: 'prev,next today',
      center: 'title',
      end: '',
    },
    buttonText: {
      // changing default casing of localized button text
      day: 'nap',
      week: 'hét',
      month: 'hónap',
      today: 'Ma',
    },
    contentHeight: '100vh',
    views: {
      bookingView: {
        type: 'timeGridWeek',
        slotMinTime: { hours: 0 },
        slotMaxTime: { hours: 24 },
        allDaySlot: false,
      },
    },
    height: 'auto',
    events: (_, success) => {
      this.calendar?.getApi()?.removeAllEvents();
      const businessHours = this.bookingService.userData.settings()?.businessHours ?? [];
      const allScheduledEvents: EventInput[] = this.bookingService.userData.events().map((e) => {
        const isEditable = this.bookingService.isEventEditable(e.id);
        return {
          ...e,
          allow: () => isEditable,
          color: isEditable ? undefined : '#888',
          backgroundColor: isEditable ? undefined : '#888',
          editable: isEditable,
          duration: e.allDay ? undefined : { minutes: getDuration(e.start, e.end) },
          durationEditable: false,
          rrule: e.recurrenceData?.rrule,
          overlap: false,
          constraint: businessHours.length > 0 ? 'businessHours' : undefined,
        };
      });
      return success(allScheduledEvents);
    },
    eventDisplay: 'block',
    snapDuration: '00:15:00',
    eventReceive: (arg) => {
      arg.revert();
      if (arg.event.start) this.bookingService.scheduleEvent(arg.event.start);
    },
    eventDrop: (arg) => {
      if (!arg.event.start || !arg.oldEvent.start) return;
      this.bookingService.scheduleEvent(arg.event.start);
    },
    eventAllow: (dropInfo, draggedEvent) => {
      return dropInfo.start >= new Date();
    },
    plugins: [timeGridPlugin, interactionPlugin, rrulePlugin],
  };

  constructor() {
    effect(() => {
      const businessHours = this.bookingService.userData.settings()?.businessHours;
      if (businessHours && businessHours.length > 0) {
        const calendar = this.calendar?.getApi();
        if (!calendar) return;
        const timeStringToNumber = (s: string) => new Date('1970-' + s).getTime();
        const minStartTime = Math.min(...businessHours.map((h) => timeStringToNumber(h.startTime)));
        const MaxEndTime = Math.max(...businessHours.map((h) => timeStringToNumber(h.endTime)));
        calendar.setOption('eventConstraint', 'businessHours');
        calendar.setOption('businessHours', businessHours);
        calendar.setOption('slotMinTime', minStartTime);
        calendar.setOption('slotMaxTime', MaxEndTime);
      }
    });

    effect(() => {
      if (this.bookingService.userData.events()) this.updateCalendar();
    });
  }

  updateCalendar() {
    const calendar = this.calendar?.getApi();
    calendar?.removeAllEvents();
    calendar?.refetchEvents();
  }

  asEventsType(fullcalendarEvent: EventImpl) {
    if (!this.bookingService) return {} as eventsType;
    const event = this.bookingService.getEventByID(fullcalendarEvent.id);

    return {
      ...event,
      allDay: fullcalendarEvent.allDay ?? false,
      start: fullcalendarEvent.start,
      end: fullcalendarEvent.end,
    } as eventsType;
  }

  get selectedEvent() {
    return this.bookingService.getSelectedEvent();
  }

  getContactForEvent(eventId: string) {
    return undefined;
  }
}
