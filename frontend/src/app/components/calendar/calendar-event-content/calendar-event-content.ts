import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { dateToText, getDuration, weekdays } from '@/utils/datetime';
import { getPageHeight } from '@/utils/shared';

type calendarViewType = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay';

@Component({
  selector: 'app-calendar-event-content',
  imports: [CommonModule, TooltipModule, DividerModule],
  templateUrl: './calendar-event-content.html',
  styleUrl: './calendar-event-content.scss',
})
export class CalendarEventContent {
  @Input() event!: eventsType;
  @Input() contact: contactType | undefined;
  @Input() view: calendarViewType | undefined;
  @Output() onContextMenu: EventEmitter<{ eventId: string; x: number; y: number }> =
    new EventEmitter();
  isDragged = false;

  get displayMode() {
    if (!this.displayMessage) return false;
    if (['timeGridWeek', 'timeGridDay'].includes(this.view ?? '')) return 'full';
    return 'short';
  }

  get type() {
    switch (this.event.type) {
      case 'single':
        return 'Egyszeri';
      case 'recurring':
        return 'Rendszeres';
      default:
        throw this.event.type satisfies never;
    }
  }

  get time() {
    if (this.event.allDay) return 'egész nap';
    if (!this.event.start || !this.event.end) return '';
    const start = dateToText(this.event.start, { timeStyle: 'short' });
    const end = dateToText(this.event.end, { timeStyle: 'short' });

    if (this.duration < 24 * 60) return `${start} - ${end}`;

    const startDay = dateToText(this.event.start, { weekday: 'long' });
    const endDay = dateToText(this.event.end, { weekday: 'long' });
    return `\n${startDay} ${start} - ${endDay} ${end}`;
  }

  get recurrenceText() {
    const rrule = this.event.recurrenceData?.rrule;
    if (!rrule) return;

    const interval = rrule.interval > 1 ? rrule.interval + '. ' : '';
    let freq = '';
    switch (rrule.freq) {
      case 'daily':
        freq = 'napon';
        break;
      case 'weekly':
        freq = 'héten';
        break;
      case 'monthly':
        freq = 'hónapban';
        break;
      default:
        throw rrule.freq satisfies never;
    }
    const until = rrule.until
      ? dateToText(new Date(rrule.until), { dateStyle: 'long' }) + '-ig bezáróan'
      : '';

    const byWeekday = rrule.byweekday
      ? 'Ezeken a napokon: ' +
        rrule.byweekday.map((b) => weekdays.find((wd) => wd.value === b)?.name).join(', ')
      : '';
    const byMonthday = rrule.bymonthday
      ? 'A hónap ezen napjain: ' + rrule.bymonthday.map((d) => d + '.').join(', ')
      : '';

    const texts: string[] = [];
    texts.push(`Minden ${interval}${freq}`);
    texts.push(`${until}`);
    texts.push(`${byWeekday}`);
    texts.push(`${byMonthday}`);
    const text = texts.filter((t) => t !== '').join('\n');
    return text;
  }

  get displayMessage() {
    return this.event.comment as string | undefined;
  }

  get duration() {
    return getDuration(this.event.start as Date, this.event.end as Date);
  }

  get canShowToolTip() {
    return this.view !== undefined && !this.isDragged;
  }

  handleContextMenu(e: PointerEvent) {
    e.preventDefault();
    let x = this.event.start ? e.pageX : e.screenX;
    let y = this.event.start ? e.pageY : e.screenY;
    const pageWidth = document.documentElement.clientWidth;
    const pageHeight = this.event.start ? getPageHeight() : document.documentElement.clientHeight;

    // tentative approximations for the context menu size
    const contextMenuWidth = 200;
    const contextMenuHeight = 76;

    // if context menu flows out of the document page reposition it
    if (y + contextMenuHeight > pageHeight) y = pageHeight - contextMenuHeight;
    if (x + contextMenuWidth > pageWidth) x = pageWidth - contextMenuWidth;
    this.onContextMenu.emit({ eventId: this.event.id, x, y });
  }
}
