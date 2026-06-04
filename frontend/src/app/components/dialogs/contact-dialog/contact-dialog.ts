import { Component, effect, EventEmitter, inject, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserContacts } from '@/services/user-contacts';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { ColorPickerModule } from 'primeng/colorpicker';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';
import { defaultEventColor } from '@/utils/shared';

// if this is an Add New dialog and not an Edit one then 'id' will be an empty string
const defaultData = {
  id: '',
  name: '',
} satisfies contactType;

@Component({
  selector: 'app-contact-dialog',
  imports: [
    FormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    TextareaModule,
    ColorPickerModule,
    RadioButtonModule,
    SelectModule,
  ],
  templateUrl: './contact-dialog.html',
  styleUrl: './contact-dialog.scss',
})
export class ContactDialog {
  @Output() onSave: EventEmitter<string> = new EventEmitter();
  private contactsService = inject(UserContacts);
  contactData: contactType = defaultData;

  constructor() {
    effect(() => {
      const contactID = this.contactsService.contactWithEditMenuOpen();
      if (contactID == null) return;
      const contact = this.contactsService.getContactByID(contactID);
      if (contact) this.contactData = { ...contact };
      else this.contactData = { ...defaultData };
    });
  }

  get isVisible() {
    return this.contactsService.contactWithEditMenuOpen() != null;
  }

  set isVisible(value: boolean) {
    if (value) this.contactsService.contactWithEditMenuOpen.set(this.contactData.id);
    else this.contactsService.contactWithEditMenuOpen.set(null);
  }

  get defaultColor() {
    return defaultEventColor;
  }

  handleSave() {
    if (!this.contactData.name) return;

    if (this.contactData.id === '')
      this.contactsService.addContact({
        name: this.contactData.name,
        comment: this.contactData.comment,
        color: this.contactData.color,
      });
    else this.contactsService.editContact(this.contactData.id, this.contactData);

    this.onSave.emit(this.contactData.id);
    this.isVisible = false;
  }
}
