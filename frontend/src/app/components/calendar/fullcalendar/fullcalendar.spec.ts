import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Fullcalendar } from './fullcalendar';

describe('Fullcalendar', () => {
  let component: Fullcalendar;
  let fixture: ComponentFixture<Fullcalendar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Fullcalendar],
    }).compileComponents();

    fixture = TestBed.createComponent(Fullcalendar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
