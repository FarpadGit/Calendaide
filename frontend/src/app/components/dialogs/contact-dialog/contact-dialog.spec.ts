import { ComponentFixture, TestBed } from '@angular/core/testing';
import { userEvent } from 'vitest/browser';

import { ContactDialog } from './contact-dialog';
import { contactsSpy } from '@/../test/mockServices';
import { UserContacts } from '@/services/user-contacts';
import { mockContactSimple, mockContactFull } from '@/../test/mocks';

describe('ContactDialog', () => {
  let component: ContactDialog;
  let fixture: ComponentFixture<ContactDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactDialog],
      providers: [{ provide: UserContacts, useValue: contactsSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactDialog);
    component = fixture.componentInstance;
    contactsSpy.contactWithEditMenuOpen.set(mockContactSimple.id);
    contactsSpy.getContactByID.mockReturnValueOnce(mockContactSimple);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should hide dialog window by setting signal in service', async () => {
    component.isVisible = false;
    await fixture.whenStable();

    expect(contactsSpy.contactWithEditMenuOpen()).toBeNull();
  });

  it('should hide dialog window if header close (X) button is pressed', async () => {
    await fixture.whenStable();
    const closeButton = fixture.nativeElement.querySelector('.p-dialog-close-button');

    await userEvent.click(closeButton);

    await vi.waitFor(() => {
      expect(component.isVisible).toBe(false);
      expect(contactsSpy.contactWithEditMenuOpen()).toBeNull();
    });
  });

  it('should hide dialog window if Cancel button is pressed', async () => {
    await fixture.whenStable();
    const cancelButton = fixture.nativeElement.querySelector('.buttons button[type="button"]');

    await userEvent.click(cancelButton);

    expect(component.isVisible).toBe(false);
    expect(contactsSpy.contactWithEditMenuOpen()).toBeNull();
  });

  it('should display the necessary form controls', async () => {
    contactsSpy.contactWithEditMenuOpen.set(mockContactSimple.id);
    contactsSpy.getContactByID.mockReturnValueOnce(mockContactSimple);
    await fixture.whenStable();

    const query = (params: string) => fixture.nativeElement.querySelector(params);
    const nameInput: HTMLInputElement = query('input#name');
    const colorInput: HTMLInputElement = query('#color input');
    const commentTextArea: HTMLTextAreaElement = query('textarea#comment');
    const submitButton: HTMLButtonElement = query('.buttons button[type="submit"]');
    const cancelButton: HTMLButtonElement = query('.buttons button[type="button"]');

    expect(nameInput).toBeVisible();
    expect(colorInput).toBeVisible();
    expect(commentTextArea).toBeVisible();

    expect(submitButton).toBeVisible();
    expect(cancelButton).toBeVisible();
  });

  it.each([
    ['create new contact', undefined],
    ['edit existing contact (no color)', mockContactSimple],
    ['edit existing contact (has color)', mockContactFull],
  ])('should fill the form controls with contact data (%s)', async (_, contact) => {
    contactsSpy.contactWithEditMenuOpen.set(contact ? contact.id : '');
    contactsSpy.getContactByID.mockReturnValueOnce(contact);
    await fixture.whenStable();

    const query = (params: string) => fixture.nativeElement.querySelector(params);
    const nameInput: HTMLInputElement = query('input#name');
    const colorInput: HTMLInputElement = query('#color input');
    const commentTextArea: HTMLTextAreaElement = query('textarea#comment');

    if (contact) expect(nameInput.value).toBe(contact.name);
    else expect(nameInput.value).toBe('');
    if (contact && contact.color)
      expect(colorInput.style.backgroundColor).toBe(hexToRGB(contact.color));
    else expect(colorInput.style.backgroundColor).toBe(hexToRGB(component.defaultColor));
    if (contact && contact.comment) expect(commentTextArea.value).toBe(contact.comment);
    else expect(commentTextArea.value).toBe('');
  });

  it.each([
    ['no color', mockContactSimple],
    ['with color', mockContactFull],
  ])('should update contact with the inputed values (%s)', async (_, contact) => {
    contactsSpy.contactWithEditMenuOpen.set(contact.id);
    contactsSpy.getContactByID.mockReturnValueOnce(contact);
    const onSaveSpy = vi.spyOn(component.onSave, 'emit');
    await fixture.whenStable();
    const submitButton = fixture.nativeElement.querySelector('.buttons button[type="submit"]');

    await userEvent.click(submitButton);

    expect(contactsSpy.editContact).toHaveBeenCalledWith(
      contact.id,
      expect.objectContaining(contact),
    );
    expect(onSaveSpy).toHaveBeenCalledWith(contact.id);
    expect(component.isVisible).toBe(false);
  });
});

function hexToRGB(hexColor: string) {
  const hex = hexColor.substring(1);
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4), 16);
  return `rgb(${r}, ${g}, ${b})`;
}
