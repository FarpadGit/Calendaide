import { effect, inject, Injectable, signal } from '@angular/core';
import { User } from '@/services/user';
import { Auth } from '@/services/auth';
import { ContactApi } from '@/services/API/contact.api';
import { getObjectDiff } from '@/utils/shared';

@Injectable({
  providedIn: 'root',
})
export class UserContacts {
  private userService = inject(User);
  private authService = inject(Auth);
  private apiService = inject(ContactApi);

  private activeContactId: string = '';
  contactWithEditMenuOpen = signal<string | null>(null);

  constructor() {
    effect(() => {
      const firstContact = this.contacts().at(0);
      if (this.activeContactId === '' && firstContact) this.activeContactId = firstContact.id;
    });
  }

  get contacts() {
    return this.userService.currentUserData.contacts;
  }

  getActiveContact() {
    return this.getContactByID(this.activeContactId) ?? this.contacts()?.at(0) ?? null;
  }

  setActiveContact(contactId: string) {
    this.activeContactId = contactId;
  }

  getContactByID(contactId: string) {
    if (!contactId) return;
    return this.contacts().find((c) => c.id === contactId);
  }

  addContact(newContact: Omit<contactType, 'id' | 'userId'>) {
    const currentUser = this.userService.currentUserData.user();
    if (!currentUser) return;

    const _newContact: contactType = {
      ...newContact,
      id: crypto.randomUUID(),
    };

    this.contacts.update((prev) => [...prev, _newContact]);

    if (this.authService.canAutosaveToServer()) {
      this.apiService.createContact(_newContact);
    }
  }

  removeContact(contactId: string) {
    this.contacts.update((prev) => prev.filter((c) => c.id !== contactId));
    if (this.authService.canAutosaveToServer()) {
      this.apiService.deleteContact(contactId);
    }
  }

  editContact(contactId: string, newData: Partial<contactType>) {
    const contact = this.getContactByID(contactId);
    if (!contact) return;

    const _newData = { ...newData };
    delete _newData.id;
    const editedContact = { ...contact, ..._newData };

    this.contacts.update((prev) => prev.map((c) => (c.id !== contactId ? c : editedContact)));
    if (this.authService.canAutosaveToServer()) {
      const diff = getObjectDiff(contact, editedContact);
      if (diff) this.apiService.updateContact(contactId, diff);
    }
  }
}
