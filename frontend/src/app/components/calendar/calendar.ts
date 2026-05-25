import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { API } from '@/services/API/api';
import { User } from '@/services/user';
import { UserEvents } from '@/services/user-events';
import { Fullcalendar } from '@/components/calendar/fullcalendar/fullcalendar';
import { CalendarToolbar } from '@/components/calendar/calendar-toolbar/calendar-toolbar';
import { ContextMenu } from '@/components/dialogs/context-menu/context-menu';
import { EventDialog } from '@/components/dialogs/event-dialog/event-dialog';
import { ContactDialog } from '@/components/dialogs/contact-dialog/contact-dialog';
import { Nanobar } from '@/components/calendar/nanobar/nanobar';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';

export const defaultEventColor: string = '#3788d8';

@Component({
  selector: 'app-calendar',
  imports: [
    CommonModule,
    ToastModule,
    ProgressSpinnerModule,
    CalendarToolbar,
    Fullcalendar,
    ContextMenu,
    EventDialog,
    ContactDialog,
    Nanobar,
  ],
  providers: [MessageService],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
})
export class Calendar {
  private apiService = inject(API);
  private userService = inject(User);
  private eventsService = inject(UserEvents);
  private toastService = inject(MessageService);
  defaultEventColor = defaultEventColor;

  constructor() {
    effect(() => {
      const serverActionResponse = this.apiService.serverResponse();
      if (serverActionResponse) {
        if (serverActionResponse.type === 'loading') this.addLoadingToast();
        if (serverActionResponse.type === 'success')
          this.addToastMessage(serverActionResponse.message);
        if (serverActionResponse.type === 'error')
          this.addToastMessage(serverActionResponse.message, 'error');
      }
    });
  }

  get saveMode() {
    return this.userService.getUserSettings()?.saveMode;
  }

  get contextMenuOpen() {
    return this.eventsService.eventWithContextMenuOpen.current() != null;
  }

  addLoadingToast() {
    this.toastService.add({
      key: 'loading',
      sticky: true,
      severity: 'custom',
    });
  }

  addToastMessage(message: string, severity: string = 'success') {
    this.toastService.clear('loading');
    this.toastService.add({
      key: 'message',
      summary: 'Mentés',
      detail: message,
      severity,
    });
  }
}
