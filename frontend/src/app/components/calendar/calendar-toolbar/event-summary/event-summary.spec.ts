import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventSummary } from './event-summary';
import { eventsSpy } from '@/../test/mockServices';
import { UserEvents } from '@/services/user-events';
import { addToDateMinutes } from '@/utils/datetime';

describe('EventSummary', () => {
  let component: EventSummary;
  let fixture: ComponentFixture<EventSummary>;

  const today = new Date();
  const afterTomorrow = new Date(today);
  afterTomorrow.setDate(afterTomorrow.getDate() + 2);
  const unpackedEvents: eventsType[] = [
    {
      id: 'mockEvent1ID',
      contactId: 'mockContactID',
      type: 'single',
      title: 'Event Today 1',
      start: today,
      end: addToDateMinutes(today, 60),
    },
    {
      id: 'mockEvent2ID',
      contactId: 'mockContactID',
      type: 'single',
      title: 'Event Today 2',
      start: today,
      end: addToDateMinutes(today, 60),
    },
    {
      id: 'mockEvent3ID',
      contactId: 'mockContactID',
      type: 'single',
      title: 'Event After Tomorrow',
      start: afterTomorrow,
      end: addToDateMinutes(afterTomorrow, 60),
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventSummary],
      providers: [{ provide: UserEvents, useValue: eventsSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(EventSummary);
    component = fixture.componentInstance;
  });

  it('should create', async () => {
    await fixture.whenStable();

    expect(component).toBeTruthy();
  });

  it('should display a date picker component, a list of events for selected date and a list of events for the next 7 days if there is any', async () => {
    eventsSpy.getUnpackedEvents.mockReturnValueOnce(unpackedEvents);
    await fixture.whenStable();
    const datePicker = fixture.nativeElement.querySelector('p-datepicker');
    const eventContainers = fixture.nativeElement.querySelectorAll('p-panel');
    const eventsToday = eventContainers[0].querySelectorAll('.event-field');
    const eventsTomorrow = eventContainers[1].querySelectorAll('.event-field');

    expect(datePicker).toBeTruthy();
    expect(eventContainers.length).toBe(2);
    eventContainers.forEach((container: HTMLElement) => {
      expect(container).toBeVisible();
    });
    expect(component.eventsForCurrentDate.length).toBe(2);
    expect(eventsToday.length).toBe(2);
    expect(component.futureEvents.length).toBe(1);
    expect(eventsTomorrow.length).toBe(1);
  });

  it('should not display a list of future events for the next 7 days if there are none', async () => {
    eventsSpy.getUnpackedEvents.mockReturnValueOnce(unpackedEvents.slice(0, 2));
    await fixture.whenStable();
    const eventContainers = fixture.nativeElement.querySelectorAll('p-panel');

    expect(component.futureEvents.length).toBe(0);
    expect(eventContainers.length).toBe(1);
  });

  it('should emit an event on date select', async () => {
    eventsSpy.getUnpackedEvents.mockReturnValueOnce(unpackedEvents);
    const onDateSelectSpy = vi.spyOn(component.onDateSelect, 'emit');
    const date = new Date();
    await fixture.whenStable();

    component.handleDateSelect(date);

    expect(onDateSelectSpy).toHaveBeenCalledWith(date);
  });

  it('should open the event edit dialog if user selects an event', async () => {
    eventsSpy.getUnpackedEvents.mockReturnValueOnce(unpackedEvents);
    const id = 'mockID';
    await fixture.whenStable();

    component.handleEventSelect(id);

    expect(eventsSpy.eventWithEditMenuOpen()).toBe(id);
  });

  afterEach(() => {
    eventsSpy.eventWithEditMenuOpen.set(null);
  });
});
