import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserEvents } from '@/services/user-events';
import { UserContacts } from '@/services/user-contacts';
import { CalendarEventContent } from '@/components/calendar/calendar-event-content/calendar-event-content';
import { PanelModule } from 'primeng/panel';
import { FloatLabelModule } from 'primeng/floatlabel';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { PopoverModule } from 'primeng/popover';
import { TooltipModule } from 'primeng/tooltip';
import { SplitButtonModule } from 'primeng/splitbutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { Draggable } from '@fullcalendar/interaction';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-new-events',
  imports: [
    FormsModule,
    PanelModule,
    FloatLabelModule,
    SelectModule,
    ButtonModule,
    PopoverModule,
    TooltipModule,
    SplitButtonModule,
    InputNumberModule,
    CalendarEventContent,
  ],
  templateUrl: './new-events.html',
  styleUrl: './new-events.scss',
})
export class NewEvents implements AfterViewInit, OnDestroy {
  private eventsService = inject(UserEvents);
  private contactsService = inject(UserContacts);
  @ViewChildren('draggable') private draggableElements?: QueryList<ElementRef<HTMLDivElement>>;
  private draggables?: Draggable[];

  private elementChangeSub?: Subscription;

  contacts: { name: string; value: string; color?: string }[] = [];
  NumNewEvent = 1;

  constructor() {
    effect(() => {
      const contacts = this.contactsService.contacts();
      this.contacts = contacts.map((c) => ({ name: c.name, value: c.id, color: c.color }));
    });
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

  get activeContact() {
    return this.contactsService.getActiveContact()?.id ?? '';
  }

  set activeContact(value: string) {
    this.contactsService.setActiveContact(value);
  }

  handleEventContextMenu({ eventId, x, y }: { eventId: string; x: number; y: number }) {
    this.eventsService.openContextMenuForEvent(eventId, x, y);
  }

  private updateDraggables(
    unscheduledEvents: ReturnType<UserEvents['getUnscheduledEventsForContact']>,
  ) {
    if (!this.draggableElements) return;

    this.draggables?.forEach((d) => d.destroy());
    const eventColor = this.contactsService.getActiveContact()?.color;

    this.draggables = unscheduledEvents.map((e, i) => {
      const el = this.draggableElements?.get(i)?.nativeElement!;
      if (eventColor) {
        el.style.backgroundColor = eventColor;
        el.style.borderColor = eventColor;
      }

      return new Draggable(el, {
        eventData: {
          id: e.id,
          title: e.title,
          comment: e.comment,
          color: eventColor,
        },
      });
    });
  }

  get unscheduledEvents() {
    const currentContact = this.contactsService.getActiveContact();
    if (!currentContact) return [];
    return this.eventsService.getUnscheduledEventsForContact(currentContact.id);
  }

  clearUnscheduledEvents() {
    if (this.unscheduledEvents.length > 0)
      this.eventsService.removeEvents(this.unscheduledEvents.map((e) => e.id));
  }

  getContact(contactId: string) {
    return this.contactsService.getContactByID(contactId) ?? undefined;
  }

  addNewContact() {
    this.contactsService.contactWithEditMenuOpen.set('');
  }

  addNewEvent() {
    if (this.NumNewEvent < 1) this.NumNewEvent = 1;
    this.eventsService.addEvent(
      {
        type: 'single',
        title: this.contactsService.getActiveContact()?.name ?? 'Új Esemény',
      },
      this.NumNewEvent,
    );
  }

  editContact() {
    this.contactsService.contactWithEditMenuOpen.set(
      this.contactsService.getActiveContact()?.id ?? '',
    );
  }

  deleteContact() {
    const activeContact = this.contactsService.getActiveContact();
    if (activeContact) this.contactsService.removeContact(activeContact.id);
  }
}
