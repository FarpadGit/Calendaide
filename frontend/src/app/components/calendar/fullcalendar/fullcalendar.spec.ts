import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Fullcalendar } from './fullcalendar';
import { User } from '@/services/user';
import { UserEvents } from '@/services/user-events';
import { userSpy, eventsSpy } from '@/../test/mockServices';
import { mockEventSimple, mockUser } from '@/../test/mocks';

describe('Fullcalendar', () => {
  let component: Fullcalendar;
  let fixture: ComponentFixture<Fullcalendar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Fullcalendar],
      providers: [
        { provide: User, useValue: userSpy },
        { provide: UserEvents, useValue: eventsSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Fullcalendar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the fullcalendar component', () => {
    const fullcalendar = fixture.nativeElement.querySelector('full-calendar');

    expect(fullcalendar).toBeTruthy();
  });

  it('should emit an event if calendar date cell was clicked', () => {
    const date = new Date();
    const onDateSelectSpy = vi.spyOn(component.onDateSelect, 'emit');

    component.handleDateClick(date);

    expect(onDateSelectSpy).toHaveBeenCalledWith(date);
  });

  it('should open the event context menu with client window coordnates', () => {
    const params = { eventId: mockEventSimple.id, x: 10, y: 10 };
    component.handleEventContextMenu(params);

    expect(eventsSpy.openContextMenuForEvent).toHaveBeenCalledWith(
      params.eventId,
      params.x,
      params.y,
    );
  });

  it('should update calendar if user data was fetched from server', async () => {
    const updateSpy = vi.spyOn(component, 'updateCalendar');

    userSpy.currentUserData.user.set(mockUser as ReturnType<User['currentUserData']['user']>);
    await fixture.whenStable();

    expect(updateSpy).toHaveBeenCalled();
  });

  afterEach(() => {
    userSpy.currentUserData.user.set(null);
  });
});
