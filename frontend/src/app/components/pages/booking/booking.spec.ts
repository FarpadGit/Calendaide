import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Booking } from './booking';
import { BookingToolbar } from '@/components/pages/booking/booking-toolbar/booking-toolbar';
import { Fullcalendar } from '@/components/pages/booking/fullcalendar/fullcalendar';
import { Booking as BookingService } from '@/services/booking';
import { bookingSpy, routerSpy } from '../../../../test/mockServices';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

// mocked out components
@Component({
  selector: 'app-fullcalendar, app-booking-toolbar',
  template: '<div>Mock</div>',
})
class MockComponent {
  updateCalendar() {}
}

describe('BookingComponent', () => {
  const mockActivatedRoute = {
    params: of({
      get: (key: string) => {
        if (key === 'bookingId') return 'fakeBookingID';
        return null;
      },
    }),
  };
  let component: Booking;
  let fixture: ComponentFixture<Booking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        { provide: BookingService, useValue: bookingSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: routerSpy },
      ],
    })
      .overrideComponent(Booking, {
        remove: { imports: [BookingToolbar, Fullcalendar] },
        add: { imports: [MockComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(Booking);
    component = fixture.componentInstance;
  });

  it('should create', async () => {
    await fixture.whenStable();

    expect(component).toBeTruthy();
  });

  it('should display a calendar and toolbar component', async () => {
    await fixture.whenStable();
    const calendar = fixture.nativeElement.querySelector('app-fullcalendar');
    const toolbar = fixture.nativeElement.querySelector('app-booking-toolbar');

    expect(calendar).toBeTruthy();
    expect(calendar).toBeVisible();
    expect(toolbar).toBeTruthy();
    expect(toolbar).toBeVisible();
  });

  it('should display a loading indicator before data is fetched from server', async () => {
    await fixture.whenStable();
    const loader = fixture.nativeElement.querySelector('#loading-screen');

    expect(loader).toBeTruthy();
    expect(loader).toBeVisible();
  });

  it('should not display a loading indicator after data has been fetched from server', async () => {
    bookingSpy.readEvents?.mockResolvedValueOnce(true);
    await fixture.whenStable();
    const loader = fixture.nativeElement.querySelector('#loading-screen');

    expect(loader).toBeFalsy();
  });

  it('should redirect away if user events for booking ID failed to load', async () => {
    bookingSpy.readEvents?.mockResolvedValueOnce(false);
    await fixture.whenStable();

    expect(routerSpy.navigateByUrl).toHaveBeenCalled();
  });
});
