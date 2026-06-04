import { TestBed } from '@angular/core/testing';

import { UserContacts } from './user-contacts';
import { User } from '@/services/user';
import { Auth } from '@/services/auth';
import { ContactApi } from '@/services/API/contact.api';
import { userSpy, authSpy, contactApiSpy } from '@/../test/mockServices';
import { mockContacts, mockUser } from '@/../test/mocks';

describe('UserContacts', () => {
  let service: UserContacts;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: User, useValue: userSpy },
        { provide: Auth, useValue: authSpy },
        { provide: ContactApi, useValue: contactApiSpy },
      ],
    });
    service = TestBed.inject(UserContacts);
    userSpy.currentUserData.user.set({ ...mockUser } as ReturnType<
      typeof userSpy.currentUserData.user
    >);
    userSpy.currentUserData.contacts.set([...mockContacts]);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return contacts stored in userService', () => {
    expect(service.contacts()).toEqual(mockContacts);
  });

  it('should return the currently active contact', () => {
    const randomIndex = Math.round(Math.random() * (mockContacts.length - 1));
    const contact = mockContacts[randomIndex];
    service.setActiveContact(contact.id);

    expect(service.getActiveContact()).toEqual(contact);
  });

  it('should return the first contact if active contact is not set', () => {
    service.setActiveContact('');

    expect(service.getActiveContact()).toEqual(mockContacts[0]);
  });

  it('should return null if no contacts are set', () => {
    userSpy.currentUserData.contacts.set([]);

    expect(service.getActiveContact()).toBeNull();
  });

  it('should return a contact by ID', () => {
    const randomIndex = Math.round(Math.random() * (mockContacts.length - 1));
    const contact = mockContacts[randomIndex];

    expect(service.getContactByID(contact.id)).toEqual(contact);
  });

  it.each([false, true])('should add a new contact and shouldSaveToServer is %s', (toServer) => {
    authSpy.canAutosaveToServer.mockReturnValueOnce(toServer);
    const newContact: contactType = {
      id: 'newContactID',
      name: 'New Contact',
      color: '#aabbcc',
      comment: 'Comment for New Contact',
    };
    const expectedContact = {
      id: expect.any(String),
      name: 'New Contact',
      color: '#aabbcc',
      comment: 'Comment for New Contact',
    };

    service.addContact(newContact);

    expect(service.contacts()).toContainEqual(expect.objectContaining(expectedContact));
    if (toServer) expect(contactApiSpy.createContact).toHaveBeenCalledWith(expectedContact);
    else expect(contactApiSpy.createContact).not.toHaveBeenCalled();
  });

  it.each([false, true])('should remove a contact and shouldSaveToServer is %s', (toServer) => {
    authSpy.canAutosaveToServer.mockReturnValueOnce(toServer);
    const randomIndex = Math.round(Math.random() * (mockContacts.length - 1));
    const contact = mockContacts[randomIndex];

    service.removeContact(contact.id);

    expect(service.contacts()).not.toContainEqual(contact);
    if (toServer) expect(contactApiSpy.deleteContact).toHaveBeenCalledWith(contact.id);
    else expect(contactApiSpy.deleteContact).not.toHaveBeenCalled();
  });

  it.each([false, true])('should update a contact and shouldSaveToServer is %s', (toServer) => {
    authSpy.canAutosaveToServer.mockReturnValueOnce(toServer);
    const id = mockContacts[0].id;
    const updatedContact: Partial<contactType> = {
      color: '#ff00ff',
      comment: 'Updated Comment',
    };

    service.editContact(id, updatedContact);

    expect(service.contacts()[0]).toEqual(expect.objectContaining(updatedContact));
    expect(service.contacts()[0].name).toBe(mockContacts[0].name);
    if (toServer) expect(contactApiSpy.updateContact).toHaveBeenCalledWith(id, updatedContact);
    else expect(contactApiSpy.updateContact).not.toHaveBeenCalled();
  });

  afterAll(() => {
    userSpy.currentUserData.user.set(null);
    userSpy.currentUserData.contacts.set([]);
  });
});
