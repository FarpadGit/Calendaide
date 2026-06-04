import { signal } from '@angular/core';
import { vi, MockedObject } from 'vitest';
import { API } from '@/services/API/api';
import { ContactApi } from '@/services/API/contact.api';
import { EventApi } from '@/services/API/event.api';
import { UserApi } from '@/services/API/user.api';
import { Auth } from '@/services/auth';
import { UserContacts } from '@/services/user-contacts';
import { UserEvents } from '@/services/user-events';
import { User } from '@/services/user';
import {
  mockContacts,
  mockEvents,
  mockScheduledEvents,
  mockUnscheduledEvents,
  mockUserSettings,
} from './mocks';
import { Router } from '@angular/router';

type mockServiceType<T> = Required<Partial<MockedObject<T>>>;

export const apiSpy: mockServiceType<API> = {
  login: vi.fn(),
  loginWithGoogle: vi.fn(),
  logout: vi.fn(),
  makeRequest: vi.fn(),
  refresh: vi.fn(),
  revokeBearer: vi.fn(),
  serverResponse: vi.mocked(signal(null as ReturnType<API['serverResponse']>)),
  setBearer: vi.fn(),
};
export const contactApiSpy: mockServiceType<ContactApi> = {
  createContact: vi.fn(),
  deleteContact: vi.fn(),
  updateContact: vi.fn(),
};
export const eventApiSpy: mockServiceType<EventApi> = {
  createEvents: vi.fn(),
  deleteEvents: vi.fn(),
  updateEvents: vi.fn(),
};
export const userApiSpy: mockServiceType<UserApi> = {
  createUser: vi.fn(),
  deleteUser: vi.fn(),
  updateUser: vi.fn(),
  saveAllUserData: vi.fn(),
};

export const authSpy: mockServiceType<Auth> = {
  authenticate: vi.fn(),
  canAutosaveToServer: vi.fn(() => false),
  isDemoUser: vi.fn(),
  loginToDemo: vi.fn(),
  loginUser: vi.fn(),
  loginUserWithGoogle: vi.fn(),
  logoutUser: vi.fn(),
  refreshUser: vi.fn(),
  registerUser: vi.fn(),
};
export const contactsSpy: mockServiceType<UserContacts> = {
  addContact: vi.fn(),
  contacts: vi.mocked(signal([] as ReturnType<UserContacts['contacts']>)),
  contactWithEditMenuOpen: vi.mocked(
    signal(null as ReturnType<UserContacts['contactWithEditMenuOpen']>),
  ),
  editContact: vi.fn(),
  getActiveContact: vi.fn(() => mockContacts[0]),
  getContactByID: vi.fn((id) => mockContacts.find((c) => c.id === id)),
  removeContact: vi.fn(),
  setActiveContact: vi.fn(),
};
export const eventsSpy: mockServiceType<UserEvents> = {
  addEvent: vi.fn(),
  contextMenuPosition: { x: 0, y: 0 },
  editEvent: vi.fn(),
  editEvents: vi.fn(),
  eventBeingDragged: vi.mocked(signal(null as ReturnType<UserEvents['eventBeingDragged']>)),
  events: vi.mocked(signal([] as ReturnType<UserEvents['events']>)),
  eventWithContextMenuOpen: {
    current: vi.mocked(
      signal(null as ReturnType<UserEvents['eventWithContextMenuOpen']['current']>),
    ),
    previous: vi.mocked(
      signal(null as ReturnType<UserEvents['eventWithContextMenuOpen']['previous']>),
    ),
  },
  eventWithEditMenuOpen: vi.mocked(signal(null as ReturnType<UserEvents['eventWithEditMenuOpen']>)),
  getAllScheduledEvents: vi.fn(() => mockEvents),
  getContactForEvent: vi.fn(() => mockContacts[0]),
  getEventByID: vi.fn((id) => mockEvents.find((e) => e.id === id)),
  getScheduledEventsForContact: vi.fn(() => mockScheduledEvents),
  getUnpackedEvents: vi.fn(() => mockEvents),
  getUnscheduledEventsForContact: vi.fn(() => mockUnscheduledEvents),
  openContextMenuForEvent: vi.fn(),
  removeEvent: vi.fn(),
  removeEvents: vi.fn(),
  rescheduleEvent: vi.fn(),
};
export const userSpy: mockServiceType<User> = {
  currentUserData: {
    contacts: vi.mocked(signal([] as ReturnType<User['currentUserData']['contacts']>)),
    events: vi.mocked(signal([] as ReturnType<User['currentUserData']['events']>)),
    user: vi.mocked(signal(null as ReturnType<User['currentUserData']['user']>)),
    setUser: vi.fn(),
  },
  deleteUser: vi.fn(),
  getUserSettings: vi.fn(() => mockUserSettings),
  saveAll: vi.fn(),
  saveUserSettings: vi.fn(),
};

export const routerSpy: Partial<MockedObject<Router>> = {
  navigate: vi.fn(),
  navigateByUrl: vi.fn(),
};
