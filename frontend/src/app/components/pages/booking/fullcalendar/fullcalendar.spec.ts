import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Fullcalendar } from './fullcalendar';
import { bookingSpy } from '@/../test/mockServices';
import { Booking } from '@/services/booking';
import { mockEvents } from '../../../../../test/mocks';

describe('Fullcalendar', () => {
  let component: Fullcalendar;
  let fixture: ComponentFixture<Fullcalendar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Fullcalendar],
      providers: [{ provide: Booking, useValue: bookingSpy }],
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

  it('should update calendar if event data was fetched from server', async () => {
    const updateSpy = vi.spyOn(component, 'updateCalendar');

    bookingSpy.userData?.events.set(mockEvents as ReturnType<Booking['userData']['events']>);
    await fixture.whenStable();

    expect(updateSpy).toHaveBeenCalled();
  });
});
