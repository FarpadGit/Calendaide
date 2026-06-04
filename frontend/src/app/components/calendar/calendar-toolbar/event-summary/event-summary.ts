import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserEvents } from '@/services/user-events';
import { DatePickerModule, DatePickerPassThrough } from 'primeng/datepicker';
import { DatePickerDesignTokens } from '@primeuix/themes/types/datepicker';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { dateToText } from '@/utils/datetime';

@Component({
  selector: 'app-event-summary',
  imports: [DatePickerModule, ButtonModule, CommonModule, PanelModule],
  templateUrl: './event-summary.html',
  styleUrl: './event-summary.scss',
})
export class EventSummary implements OnInit {
  @Output() onDateSelect: EventEmitter<Date> = new EventEmitter();
  private eventsService = inject(UserEvents);
  currentSelectedDate: Date = new Date(0);
  eventsForCurrentDate: eventsType[] = [];
  futureEvents: { date: Date; events: eventsType[] }[] = [];

  datePickerTokens: DatePickerDesignTokens = {
    date: {
      hoverBackground: '{primary.contrastColor}',
    },
    panel: {
      background: '',
      borderColor: 'transparent',
      padding: '0 0 0.75rem 0',
    },
    header: {
      background: '',
      borderColor: '{text.color}',
    },
    buttonbar: {
      borderColor: '{text.color}',
    },
    selectMonth: {
      hoverBackground: '{primary.contrastColor}',
    },
    selectYear: {
      hoverBackground: '{primary.contrastColor}',
    },
    today: {
      background: '{primary.100}',
    },
  };

  datePickerStyles: DatePickerPassThrough = {
    root: {
      style: {
        minWidth: '330px',
        '--p-button-text-secondary-hover-background': 'var(--p-primary-contrast-color)',
        '--p-button-text-secondary-active-background': 'var(--p-surface-100)',
      } as Partial<CSSStyleDeclaration>,
    },
  };

  ngOnInit(): void {
    this.handleDateSelect(new Date());
  }

  getDateString(date?: Date) {
    if (!date) return '';
    return dateToText(date, { dateStyle: 'short' }) + ' ' + dateToText(date, { weekday: 'long' });
  }

  getTimeString(event: eventsType, baseTime?: Date) {
    if (!event.start) return '';
    if (event.allDay) return 'egész nap';
    if (event.type === 'single' && baseTime && event.start.getTime() < baseTime.getTime())
      return 'folyt.';
    return dateToText(event.start, { hour: '2-digit', minute: '2-digit' });
  }

  getColor(eventId: string) {
    return this.eventsService.getContactForEvent(eventId)?.color;
  }

  handleDateSelect(date: Date) {
    date.setHours(0, 0, 0, 0);
    if (date.getTime() === this.currentSelectedDate.getTime()) return;

    const unpackedEvents = this.eventsService.getUnpackedEvents();
    this.currentSelectedDate = date;
    this.eventsForCurrentDate = this.getEventsByDate(date, unpackedEvents);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    const futureEvents: typeof this.futureEvents = [];

    for (let d = nextDay, i = 0; i < 7; d.setDate(d.getDate() + 1), i++) {
      const events = this.getEventsByDate(d, unpackedEvents);
      if (events.length > 0) futureEvents.push({ date: new Date(d), events });
    }

    this.futureEvents = futureEvents;
    this.onDateSelect.emit(date);
  }

  handleEventSelect(id: string) {
    this.eventsService.eventWithEditMenuOpen.set(id);
  }

  private getEventsByDate(date: Date, events: eventsType[]) {
    const dateTime = date.getTime();

    const eventsForDate = events.filter((e) => {
      if (!e.start || (!e.end && !e.allDay)) return false;
      const start = new Date(e.start);
      const end = new Date(e.end ?? e.start);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      if (e.recurrenceData) {
        const whileGuard = e.recurrenceData.rrule.until
          ? Math.min(date.getTime(), new Date(e.recurrenceData.rrule.until).getTime())
          : date.getTime();
        while (start.getTime() < whileGuard) {
          if (e.recurrenceData.rrule.freq === 'daily') {
            start.setDate(start.getDate() + e.recurrenceData.rrule.interval);
            end.setDate(end.getDate() + e.recurrenceData.rrule.interval);
          }
          if (e.recurrenceData.rrule.freq === 'weekly') {
            start.setDate(start.getDate() + 7 * e.recurrenceData.rrule.interval);
            end.setDate(end.getDate() + 7 * e.recurrenceData.rrule.interval);
          }
          if (e.recurrenceData.rrule.freq === 'monthly') {
            start.setMonth(start.getMonth() + e.recurrenceData.rrule.interval);
            end.setMonth(end.getMonth() + e.recurrenceData.rrule.interval);
          }
        }
      }
      const beforeDate = start.getTime() < dateTime && end.getTime() < dateTime;
      const afterDate = start.getTime() > dateTime && end.getTime() > dateTime;
      return !beforeDate && !afterDate;
    });

    return eventsForDate.sort((a, b) => a.start!.getTime() - b.start!.getTime());
  }
}
