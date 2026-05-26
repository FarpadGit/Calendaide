import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { UserMenu } from '@/components/calendar/calendar-toolbar/user-menu/user-menu';
import { NewEvents } from '@/components/calendar/calendar-toolbar/new-events/new-events';
import { EventSummary } from '@/components/calendar/calendar-toolbar/event-summary/event-summary';
import { UserSettings } from '@/components/calendar/calendar-toolbar/user-settings/user-settings';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-calendar-toolbar',
  imports: [TabsModule, UserMenu, NewEvents, EventSummary, UserSettings, NgOptimizedImage],
  templateUrl: './calendar-toolbar.html',
  styleUrl: './calendar-toolbar.scss',
})
export class CalendarToolbar {
  @Output() onDateSelect: EventEmitter<Date> = new EventEmitter();
  @ViewChild('eventSummaryPanel') private eventSummaryPanel?: EventSummary;

  tabsTokens = {
    tablist: {
      background: '',
      borderWidth: 0,
    },
    tabpanel: {
      background: '',
      padding: '0 0.5rem 0.5rem 0.5rem',
    },
    tab: {
      borderWidth: 0,
      background: '{primary.50}',
      active: {
        background: '{primary.100}',
      },
      hover: {
        background: '{primary.100}',
        color: '{text.mutedColor}',
      },
    },
    activeBar: {
      height: 0,
    },
  };

  selectDate(date: Date) {
    this.eventSummaryPanel?.handleDateSelect(date);
  }
}
