import { AfterViewInit, Component, inject, OnDestroy, signal, ViewChild } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Booking as BookingService } from '@/services/booking';
import { Fullcalendar } from '@/components/pages/booking/fullcalendar/fullcalendar';
import { BookingToolbar } from '@/components/pages/booking/booking-toolbar/booking-toolbar';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-booking',
  imports: [CommonModule, Fullcalendar, BookingToolbar, NgOptimizedImage, ProgressSpinner],
  templateUrl: './booking.html',
  styleUrl: './booking.scss',
})
export class Booking implements AfterViewInit, OnDestroy {
  @ViewChild('calendar') fullCalendar?: Fullcalendar;
  private bookingService = inject(BookingService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private routeSub?: Subscription;
  isLoading = signal(true);

  constructor() {
    this.routeSub = this.route.params.subscribe((params) => {
      if (params['bookingId']) {
        this.bookingService.userData.bookingId.set(params['bookingId']);
      }
    });
  }

  async ngAfterViewInit(): Promise<void> {
    const success = await this.bookingService.readEvents();
    if (!success) {
      await this.router.navigateByUrl('/');
      return;
    }
    this.fullCalendar?.updateCalendar();
    this.isLoading.set(false);
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  handleEventSelect(id: string) {
    if (this.bookingService.isEventEditable(id)) this.bookingService.selectNewEvent(id);
  }
}
