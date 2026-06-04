import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockedObject } from 'vitest';

import { Calendar } from './calendar';
import { API } from '@/services/API/api';
import { User } from '@/services/user';
import { UserEvents } from '@/services/user-events';
import { CalendarToolbar } from '@/components/calendar/calendar-toolbar/calendar-toolbar';
import { Fullcalendar } from '@/components/calendar/fullcalendar/fullcalendar';
import { ContextMenu } from '@/components/dialogs/context-menu/context-menu';
import { EventDialog } from '@/components/dialogs/event-dialog/event-dialog';
import { ContactDialog } from '@/components/dialogs/contact-dialog/contact-dialog';
import { MessageService } from 'primeng/api';
import { apiSpy, userSpy, eventsSpy } from '@/../test/mockServices';
import { mockEventSimple } from '@/../test/mocks';
import { userSettingValues } from '@/types.usersettings';
import { of } from 'rxjs';

// mocked out components
@Component({
  selector:
    'app-fullcalendar, app-calendar-toolbar, app-event-dialog, app-contact-dialog, app-context-menu',
  template: '<div>Mock</div>',
})
class MockComponent {}

describe('Calendar', () => {
  const toastSpy: Partial<MockedObject<MessageService>> = {
    add: vi.fn(),
    clear: vi.fn(),
    messageObserver: of(),
    clearObserver: of(),
  };
  let component: Calendar;
  let fixture: ComponentFixture<Calendar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        { provide: API, useValue: apiSpy },
        { provide: User, useValue: userSpy },
        { provide: UserEvents, useValue: eventsSpy },
      ],
    })
      .overrideComponent(Calendar, {
        remove: {
          providers: [MessageService],
          imports: [CalendarToolbar, Fullcalendar, ContextMenu, EventDialog, ContactDialog],
        },
        add: {
          providers: [{ provide: MessageService, useValue: toastSpy }],
          imports: [MockComponent],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(Calendar);
    component = fixture.componentInstance;
  });

  it('should create', async () => {
    await fixture.whenStable();
    expect(component).toBeTruthy();
  });

  it('should display a calendar and toolbar component', async () => {
    await fixture.whenStable();
    const calendar = fixture.nativeElement.querySelector('app-fullcalendar');
    const toolbar = fixture.nativeElement.querySelector('app-calendar-toolbar');

    expect(calendar).toBeTruthy();
    expect(calendar).toBeVisible();
    expect(toolbar).toBeTruthy();
    expect(toolbar).toBeVisible();
  });

  it('should display dialog windows for event and contact editing', async () => {
    await fixture.whenStable();
    const eventDialog = fixture.nativeElement.querySelector('app-event-dialog');
    const contactDialog = fixture.nativeElement.querySelector('app-contact-dialog');

    expect(eventDialog).toBeTruthy();
    expect(contactDialog).toBeTruthy();
  });

  it.each([false, true])(
    'should display a context menu for calendar events if one is set to open in service (isOpen: %s)',
    async (isOpen) => {
      eventsSpy.eventWithContextMenuOpen.current.set(isOpen ? mockEventSimple.id : null);
      await fixture.whenStable();

      const contextMenu = fixture.nativeElement.querySelector('app-context-menu');

      if (isOpen) expect(contextMenu).toBeTruthy();
      else expect(contextMenu).toBeFalsy();
    },
  );

  it('should display two toast elements to show server responses and loading messages', async () => {
    await fixture.whenStable();
    const toasts = fixture.nativeElement.querySelectorAll('p-toast');

    expect(toasts.length).toBe(2);
  });

  it.each(userSettingValues.saveMode)(
    'should display a warning message if user save mode is manual (saveMode: %s)',
    async (saveMode) => {
      userSpy.getUserSettings.mockReturnValue({ saveMode });
      await fixture.whenStable();

      const nanobar = fixture.nativeElement.querySelector('app-nanobar');

      if (saveMode === 'manual') expect(nanobar).toBeTruthy();
      else expect(nanobar).toBeFalsy();
    },
  );

  it.each(['loading', 'success', 'error'] as const)(
    'should display a toast message if user action is sent to server (message: %s)',
    async (messageType) => {
      const message = 'mockMessage';
      apiSpy.serverResponse.set({ type: messageType, message });
      await fixture.whenStable();

      if (messageType === 'loading')
        expect(toastSpy.add).toHaveBeenCalledWith(expect.objectContaining({ key: 'loading' }));
      if (messageType === 'success') {
        expect(toastSpy.clear).toHaveBeenCalledWith('loading');
        expect(toastSpy.add).toHaveBeenCalledWith(
          expect.objectContaining({ key: 'message', detail: message, severity: 'success' }),
        );
      }
      if (messageType === 'error') {
        expect(toastSpy.clear).toHaveBeenCalledWith('loading');
        expect(toastSpy.add).toHaveBeenCalledWith(
          expect.objectContaining({ key: 'message', detail: message, severity: 'error' }),
        );
      }
    },
  );

  afterEach(() => {
    apiSpy.serverResponse.set(null);
    eventsSpy.eventWithContextMenuOpen.current.set(null);
  });
});
