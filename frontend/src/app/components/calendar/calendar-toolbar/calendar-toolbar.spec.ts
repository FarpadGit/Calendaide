import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { page } from 'vitest/browser';

import { CalendarToolbar } from './calendar-toolbar';
import { UserMenu } from '@/components/calendar/calendar-toolbar/user-menu/user-menu';
import { NewEvents } from '@/components/calendar/calendar-toolbar/new-events/new-events';
import { EventSummary } from '@/components/calendar/calendar-toolbar/event-summary/event-summary';
import { UserSettings } from '@/components/calendar/calendar-toolbar/user-settings/user-settings';

// mocked out components
@Component({
  selector: 'app-user-menu, app-event-summary, app-new-events, app-user-settings',
  template: '<div>Mock</div>',
})
export class MockComponent {}

describe('CalendarToolbar', () => {
  let component: CalendarToolbar;
  let fixture: ComponentFixture<CalendarToolbar>;

  beforeAll(() => {
    const ResizeObserverMock = vi.fn(
      class {
        observe = vi.fn();
        unobserve = vi.fn();
        disconnect = vi.fn();
      },
    );
    vi.stubGlobal('ResizeObserver', ResizeObserverMock);
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({})
      .overrideComponent(CalendarToolbar, {
        remove: {
          imports: [UserMenu, NewEvents, EventSummary, UserSettings],
        },
        add: { imports: [MockComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CalendarToolbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display a background image, user menu component and 3 tabs with selectable content', () => {
    const bgImage = page.getByRole('img');
    const userMenu = fixture.nativeElement.querySelector('app-user-menu');
    const tabs = fixture.nativeElement.querySelectorAll('p-tab');
    const tabPanels = fixture.nativeElement.querySelectorAll('p-tabpanel');
    const eventSummary = fixture.nativeElement.querySelector('app-event-summary');
    const newEvents = fixture.nativeElement.querySelector('app-new-events');
    const userSettings = fixture.nativeElement.querySelector('app-user-settings');

    expect(bgImage).toBeTruthy();
    expect(bgImage).toBeVisible();
    expect(userMenu).toBeTruthy();
    expect(userMenu).toBeVisible();
    expect(tabs.length).toBe(3);
    expect(tabPanels.length).toBe(3);
    expect(eventSummary).toBeTruthy();
    expect(eventSummary).toBeVisible();
    expect(newEvents).toBeTruthy();
    expect(newEvents).not.toBeVisible();
    expect(userSettings).toBeTruthy();
    expect(userSettings).not.toBeVisible();
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });
});
