import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarEventContent } from './calendar-event-content';
import { mockContactFull, mockEventSimple, mockEventWithComment } from '@/../test/mocks';
import { addToDateMinutes } from '@/utils/datetime';

describe('CalendarEventContent', () => {
  let component: CalendarEventContent;
  let fixture: ComponentFixture<CalendarEventContent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarEventContent],
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarEventContent);
    component = fixture.componentInstance;
    component.event = mockEventSimple;
    component.view = undefined;
  });

  it('should create', async () => {
    await fixture.whenStable();

    expect(component).toBeTruthy();
  });

  it('should display the event title', async () => {
    await fixture.whenStable();
    const titleEl = fixture.nativeElement.querySelector('.event-text') as HTMLElement;

    expect(titleEl.textContent).toMatch(component.event.title);
  });

  it('should display the event title with asterisk if event has comment and calendar view is not weekly or daily', async () => {
    component.event = mockEventWithComment;
    await fixture.whenStable();
    const titleEl = fixture.nativeElement.querySelector('.event-text') as HTMLElement;

    expect(titleEl.textContent).toMatch(RegExp(component.event.title + '\\s*\\*'));
  });

  it('should display the event title and comment if event has comment and calendar view is weekly or daily', async () => {
    component.event = {
      ...mockEventWithComment,
      end: addToDateMinutes(mockEventWithComment.start!, 75),
    };
    component.view = 'timeGridWeek';
    await fixture.whenStable();
    const titleEl = fixture.nativeElement.querySelector('.event-text') as HTMLElement;

    expect(titleEl.textContent).toMatch(component.event.title);
    expect(titleEl.textContent).toMatch(component.event.comment!);
  });

  it('should not display the event comment if event is shorter than 1 hour', async () => {
    component.event = {
      ...mockEventWithComment,
      end: addToDateMinutes(mockEventWithComment.start!, 45),
    };
    component.view = 'timeGridWeek';
    await fixture.whenStable();
    const titleEl = fixture.nativeElement.querySelector('.event-text') as HTMLElement;

    expect(titleEl.textContent).toMatch(component.event.title);
    expect(titleEl.textContent).not.toMatch(component.event.comment!);
  });

  it('should have a background color matching the contact color', async () => {
    component.contact = mockContactFull;
    let rgb = component.contact.color;
    if (rgb?.startsWith('#')) rgb = hexToRGB(rgb);
    await fixture.whenStable();
    const contentEl = fixture.nativeElement.firstChild as HTMLElement;

    expect(getComputedStyle(contentEl).color).toBe(rgb);
    expect(getComputedStyle(contentEl).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  });

  it.each([
    [false, false],
    [false, true],
    [true, false],
    [true, true],
  ])(
    'should not display the tooltip if being dragged or parent element is not calendar (dragged: %s, is from calendar: %s)',
    async (isDragged, hasView) => {
      component.view = hasView ? 'timeGridWeek' : undefined;
      component.isDragged = isDragged;
      await fixture.whenStable();

      expect(component.canShowToolTip).toBe(!isDragged && hasView);
    },
  );
});

function hexToRGB(hexColor: string) {
  const hex = hexColor.substring(1);
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4), 16);
  return `rgb(${r}, ${g}, ${b})`;
}
