import { Component, EventEmitter, HostListener, inject, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserEvents } from '@/services/user-events';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-context-menu',
  imports: [CommonModule, MenuModule],
  templateUrl: './context-menu.html',
  styleUrl: './context-menu.scss',
})
export class ContextMenu {
  @Output() onRemoveEvent: EventEmitter<string> = new EventEmitter();
  private eventsService = inject(UserEvents);
  contextMenuItems: MenuItem[] = [
    {
      label: 'Szerkesztés',
      icon: 'pi pi-pen-to-square',
      command: () => this.handleUserAction('Edit'),
    },
    { label: 'Törlés', icon: 'pi pi-times', command: () => this.handleUserAction('Delete') },
  ];

  get eventId() {
    return this.eventsService.eventWithContextMenuOpen.current()!;
  }

  get cssPostion() {
    const event = this.eventsService.getEventByID(this.eventId);
    if (!event?.start && !event?.end) return 'fixed';
    return 'absolute';
  }

  get left() {
    return this.eventsService.contextMenuPosition.x;
  }

  get top() {
    return this.eventsService.contextMenuPosition.y;
  }

  handleUserAction(option: 'Edit' | 'Delete') {
    switch (option) {
      case 'Edit':
        {
          this.eventsService.eventWithEditMenuOpen.set(this.eventId);
        }
        break;
      case 'Delete':
        {
          this.eventsService.removeEvent(this.eventId!);
          this.onRemoveEvent.emit(this.eventId);
        }
        break;
      default:
        throw option satisfies never;
    }
    this.eventsService.eventWithContextMenuOpen.current.set(null);
  }

  @HostListener('document:click', ['$event'])
  documentClick(e: Event): void {
    const contextMenuOpen = this.eventsService.eventWithContextMenuOpen.current != null;

    if (contextMenuOpen && !this.bubbleUp(e.target as HTMLElement)) {
      this.eventsService.eventWithContextMenuOpen.current.set(null);
    }
  }

  // checks if an ancestor element is a context menu or not
  private bubbleUp(element: HTMLElement): boolean {
    if (element.classList.contains('context-menu')) return true;
    if (element.parentElement == null) return false;
    return this.bubbleUp(element.parentElement);
  }
}
