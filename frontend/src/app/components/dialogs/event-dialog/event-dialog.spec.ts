import { ComponentFixture, TestBed } from '@angular/core/testing';
import { page, userEvent } from 'vitest/browser';

import { EventDialog } from './event-dialog';
import { eventsSpy } from '@/../test/mockServices';
import { UserEvents } from '@/services/user-events';
import {
  mockEventSimple,
  mockEventWithAllDay,
  mockEventWithRecurrence as mockEventWithWeeklyRec,
  mockEventsWithRecGroup,
} from '@/../test/mocks';
import { getDuration } from '@/utils/datetime';

describe('EventDialog', () => {
  let component: EventDialog;
  let fixture: ComponentFixture<EventDialog>;
  const [mockEventWithDailyRec, mockEventWithMonthlyRec] = mockEventsWithRecGroup();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventDialog],
      providers: [{ provide: UserEvents, useValue: eventsSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(EventDialog);
    component = fixture.componentInstance;
    eventsSpy.eventWithEditMenuOpen.set(mockEventSimple.id);
    eventsSpy.getEventByID.mockReturnValue(mockEventSimple);
  });

  it('should create', async () => {
    await fixture.whenStable();

    expect(component).toBeTruthy();
  });

  it('should hide dialog window by setting signal in service', async () => {
    component.isVisible = false;
    await fixture.whenStable();

    expect(eventsSpy.eventWithEditMenuOpen()).toBeNull();
  });

  it('should hide dialog window if header close (X) button is pressed', async () => {
    await fixture.whenStable();
    const closeButton = fixture.nativeElement.querySelector('.p-dialog-close-button');

    await userEvent.click(closeButton);

    await vi.waitFor(() => {
      expect(component.isVisible).toBe(false);
      expect(eventsSpy.eventWithEditMenuOpen()).toBeNull();
    });
  });

  it('should hide dialog window if Cancel button is pressed', async () => {
    await fixture.whenStable();
    const cancelButton = fixture.nativeElement.querySelector('.buttons button[type="button"]');

    await userEvent.click(cancelButton);

    expect(component.isVisible).toBe(false);
    expect(eventsSpy.eventWithEditMenuOpen()).toBeNull();
  });

  it.each([
    ['simple', mockEventSimple],
    ['all day', mockEventWithAllDay],
    ['daily recurrent', mockEventWithDailyRec],
    ['weekly recurrent', mockEventWithWeeklyRec],
    ['monthly recurrent', mockEventWithMonthlyRec],
  ])('should display the necessary form controls for every event type (%s)', async (_, event) => {
    eventsSpy.eventWithEditMenuOpen.set(event.id);
    eventsSpy.getEventByID.mockReturnValueOnce(event);
    await fixture.whenStable();

    const query = (params: string) => fixture.nativeElement.querySelector(params);
    const typeSelect = page.getByRole('combobox').first().element();
    const titleInput: HTMLInputElement = query('input#title');
    const allDayRadios = page.getByRole('radio').all();
    const startDateInput: HTMLInputElement = query('input#start-time');
    const durationInput: HTMLInputElement = query('input#duration');
    const commentInput: HTMLTextAreaElement = query('textarea#comment');
    const intervalInput: HTMLInputElement = query('input#interval');
    const frequencySelect = page.getByRole('combobox').nth(2).query();
    const byweekdayPicker = query('app-week-picker');
    const bymonthdayPicker = query('app-month-picker');
    const groupIdInput: HTMLInputElement = query('input#groupId');
    const untilPicker: HTMLInputElement = query('input#until');
    const submitButton: HTMLButtonElement = query('.buttons button[type="submit"]');
    const cancelButton: HTMLButtonElement = query('.buttons button[type="button"]');
    const typeName = component.typeOptions.find((o) => o.value === event.type)?.name;

    isVisibleWithContent(typeSelect, typeName);
    isVisibleWithValue(titleInput, event.title);
    expect(allDayRadios.length).toBe(2);
    (isVisibleAndChecked(allDayRadios[0].element(), !!event.allDay),
      isVisibleAndChecked(allDayRadios[1].element(), !event.allDay),
      isVisibleWithValue(startDateInput, dateToLocaleString(event.start, !event.allDay)));
    if (event.allDay) expect(durationInput).toBeFalsy();
    else isVisibleWithValue(durationInput, getDuration(event.start, event.end).toString());
    isVisibleWithValue(commentInput, event.comment);
    if (event.recurrenceData) {
      isVisibleWithValue(intervalInput, event.recurrenceData.rrule.interval.toString());
      const freqName = component.frequencyOptions.find(
        (o) => o.value === event.recurrenceData?.rrule.freq,
      )?.name;
      isVisibleWithContent(frequencySelect!, freqName);
      isVisibleWithValue(groupIdInput, event.recurrenceData.groupId ?? '');
      if (event.recurrenceData.rrule.until)
        isVisibleWithValue(
          untilPicker,
          dateToLocaleString(new Date(event.recurrenceData.rrule.until), false),
        );
      else isVisibleWithValue(untilPicker, '');
      if (event.recurrenceData.rrule.byweekday) expect(byweekdayPicker).toBeVisible();
      else expect(byweekdayPicker).toBeFalsy();
      if (event.recurrenceData.rrule.bymonthday) expect(bymonthdayPicker).toBeVisible();
      else expect(bymonthdayPicker).toBeFalsy();
    } else {
      expect(intervalInput).toBeFalsy();
      expect(frequencySelect).toBeFalsy();
      expect(byweekdayPicker).toBeFalsy();
      expect(bymonthdayPicker).toBeFalsy();
      expect(groupIdInput).toBeFalsy();
      expect(untilPicker).toBeFalsy();
    }
    expect(submitButton).toBeVisible();
    expect(cancelButton).toBeVisible();
  });

  it.each([
    ['simple', mockEventSimple],
    ['all day', mockEventWithAllDay],
    ['daily recurrent', mockEventWithDailyRec],
    ['weekly recurrent', mockEventWithWeeklyRec],
    ['monthly recurrent', mockEventWithMonthlyRec],
  ])('should update event with the inputed values (%s)', async (_, event) => {
    eventsSpy.eventWithEditMenuOpen.set(event.id);
    eventsSpy.getEventByID.mockReturnValueOnce(event);
    const onSaveSpy = vi.spyOn(component.onSave, 'emit');
    await fixture.whenStable();
    const submitButton = fixture.nativeElement.querySelector('.buttons button[type="submit"]');

    await userEvent.click(submitButton);

    expect(eventsSpy.editEvent).toHaveBeenCalledWith(event.id, expect.objectContaining(event));
    if (event.type === 'single') expect(onSaveSpy).toHaveBeenCalledWith(event.id);
    else expect(onSaveSpy).toHaveBeenCalledWith();
    expect(component.isVisible).toBe(false);
  });
});

// helper functions
function isVisibleWithContent(element: HTMLElement | SVGElement, value: string | undefined) {
  expect(element).toBeVisible();
  expect(element.textContent).toBe(value ?? '');
}
function isVisibleWithValue(element: HTMLElement | SVGElement, value: string | undefined) {
  expect(element).toBeVisible();
  expect((element as HTMLInputElement).value).toBe(value ?? '');
}
function isVisibleAndChecked(element: HTMLElement | SVGElement, value: boolean) {
  expect(element).toBeVisible();
  expect((element as HTMLInputElement).type).toBe('radio');
  expect((element as HTMLInputElement).checked).toBe(value);
}
function dateToLocaleString(date: Date | undefined, time: boolean = true) {
  if (date == undefined) return '';
  return date
    .toLocaleString('en-US', {
      hourCycle: 'h23',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: time ? '2-digit' : undefined,
      minute: time ? '2-digit' : undefined,
    })
    .replace(',', '');
}
