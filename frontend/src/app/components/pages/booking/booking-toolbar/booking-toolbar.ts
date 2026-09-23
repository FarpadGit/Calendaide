import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  OnDestroy,
  Output,
  QueryList,
  signal,
  ViewChildren,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { type UserEvents } from '@/services/user-events';
import { Booking } from '@/services/booking';
import { Checkmark } from './checkmark';
import { CalendarEventContent } from '@/components/calendar/calendar-event-content/calendar-event-content';
import { Draggable } from '@fullcalendar/interaction';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { Textarea } from 'primeng/textarea';
import { InputText } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinner } from 'primeng/progressspinner';
import { addToDateMinutes, dateToText } from '@/utils/datetime';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-booking-toolbar',
  imports: [
    FormsModule,
    PanelModule,
    TooltipModule,
    ButtonModule,
    SelectButtonModule,
    CalendarEventContent,
    Textarea,
    InputText,
    ProgressSpinner,
    Checkmark,
  ],
  templateUrl: './booking-toolbar.html',
  styleUrl: './booking-toolbar.scss',
})
export class BookingToolbar implements AfterViewInit, OnDestroy {
  @Output() onNewEventSelect = new EventEmitter<string>();
  private bookingService = inject(Booking);
  @ViewChildren('draggable') private draggableElements?: QueryList<ElementRef<HTMLDivElement>>;
  private draggables?: Draggable[];

  selectOptions = [
    { label: 'Először foglalok időpontot', value: false },
    { label: 'Már szerepelek a kapcsolatok között', value: true },
  ];
  contactData = {
    bookIntoContact: false,
    id: null as string | null,
    name: '',
    password: '',
    submitResult: signal<'loading' | 'error' | 'success' | null>(null),
    wasListEmpty: false,
  };
  submitResult = signal<'loading' | 'error' | 'success' | null>(null);

  private elementChangeSub?: Subscription;

  get displayName() {
    return this.bookingService.userData.settings()?.displayName;
  }

  ngAfterViewInit(): void {
    if (!this.draggableElements) return;
    this.updateDraggables(this.unscheduledEvents);
    this.elementChangeSub = this.draggableElements.changes.subscribe(() =>
      this.updateDraggables(this.unscheduledEvents),
    );
  }

  ngOnDestroy(): void {
    this.elementChangeSub?.unsubscribe();
  }

  get toolbarElement() {
    return document.querySelector('#calendar-toolbar') as HTMLElement;
  }

  handleSelectChange() {
    if (this.contactData.bookIntoContact) this.bookingService.setBookableEvents([]);
    else this.bookingService.setBookableEvents([crypto.randomUUID()]);
    this.contactData.submitResult.set(null);
  }

  private updateDraggables(
    unscheduledEvents: ReturnType<UserEvents['getUnscheduledEventsForContact']>,
  ) {
    if (!this.draggableElements) return;

    this.draggables?.forEach((d) => d.destroy());
    const duration = this.bookingService.userData.settings()?.bookingData?.bookingDuration;

    this.draggables = unscheduledEvents.map((e, i) => {
      const el = this.draggableElements?.get(i)?.nativeElement!;

      return new Draggable(el, {
        eventData: {
          id: e.id,
          title: e.title,
          comment: e.comment,
          duration: { minutes: duration },
        },
      });
    });
  }

  get unscheduledEvents() {
    return this.bookingService.getUnscheduledEvents();
  }

  get selectedEvent() {
    return this.bookingService.getSelectedEvent();
  }

  toStartText(date: Date) {
    return dateToText(date, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
  toEndText(date: Date) {
    const duration = this.bookingService.userData.settings()?.bookingData?.bookingDuration ?? 0;
    const end = addToDateMinutes(new Date(date), duration);
    return this.toStartText(end);
  }

  resetScheduling() {
    this.bookingService.resetEvents();
  }

  async submitContactCredentials() {
    if (this.contactData.submitResult() === 'loading') return;
    this.contactData.submitResult.set('loading');
    const result = await this.bookingService.readEventsForContact(
      this.contactData.name,
      this.contactData.password,
    );
    if (result == null) this.contactData.submitResult.set('error');
    else {
      this.bookingService.setBookableEvents(result.ids, result.contactId, this.contactData.name);
      this.contactData.wasListEmpty = result.ids.length === 0;
      this.contactData.submitResult.set('success');
    }
  }

  async submitBooking() {
    if (!this.bookingService.hasChangedEvent()) return;
    if (this.submitResult() === 'loading') return;
    this.submitResult.set('loading');
    const success = await this.bookingService.bookEvents();
    if (!success) this.submitResult.set('error');
    else this.submitResult.set('success');
  }
}
