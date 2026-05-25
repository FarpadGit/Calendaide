import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarEventContent } from './calendar-event-content';

describe('CalendarEventContent', () => {
  let component: CalendarEventContent;
  let fixture: ComponentFixture<CalendarEventContent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarEventContent],
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarEventContent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
