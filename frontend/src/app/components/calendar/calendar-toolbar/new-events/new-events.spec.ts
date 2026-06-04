import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewEvents } from './new-events';
import { contactsSpy, eventsSpy } from '@/../test/mockServices';
import { UserContacts } from '@/services/user-contacts';
import { UserEvents } from '@/services/user-events';
import { mockContacts, mockUnscheduledEvents } from '@/../test/mocks';

describe('NewEvents', () => {
  let component: NewEvents;
  let fixture: ComponentFixture<NewEvents>;

  beforeAll(() => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewEvents],
      providers: [
        { provide: UserContacts, useValue: contactsSpy },
        { provide: UserEvents, useValue: eventsSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NewEvents);
    component = fixture.componentInstance;
    contactsSpy.contacts.set(mockContacts);
  });

  it('should create', async () => {
    await fixture.whenStable();

    expect(component).toBeTruthy();
  });

  it('should display a contact select component with More Options button, an Add New Events button and a panel for unscheduled events', async () => {
    await fixture.whenStable();
    const contactContainer = fixture.nativeElement.querySelector('.contact-list-container');
    const contactSelect = contactContainer.querySelector('.contact-list-container p-select');
    const contactOptionsButton = contactContainer.querySelector('.contact-list-container p-button');
    const newEventsButton = fixture.nativeElement.querySelector('#new-events-btn');
    const newEventsPanel = fixture.nativeElement.querySelector('#new-events-btn ~ p-panel');

    expect(contactSelect).toBeTruthy();
    expect(contactSelect).toBeVisible();
    expect(contactOptionsButton).toBeTruthy();
    expect(contactOptionsButton).toBeVisible();
    expect(newEventsButton).toBeTruthy();
    expect(newEventsButton).toBeVisible();
    expect(newEventsPanel).toBeTruthy();
  });

  it('should display every user contact', async () => {
    contactsSpy.contacts.set(mockContacts);
    await fixture.whenStable();

    expect(component.contacts.length).toBe(mockContacts.length);
  });

  it('should display a component for every unscheduled event', async () => {
    eventsSpy.getUnscheduledEventsForContact.mockReturnValue(mockUnscheduledEvents);
    await fixture.whenStable();

    const newEventsPanel = fixture.nativeElement.querySelector('#new-events-btn ~ p-panel');
    const events = newEventsPanel.querySelectorAll('app-calendar-event-content');

    expect(events.length).toBe(mockUnscheduledEvents.length);
    events.forEach((event: HTMLElement) => expect(event).toBeVisible());
  });

  it('should open the event context menu with client window coordnates', () => {
    const params = { eventId: mockUnscheduledEvents[0].id, x: 10, y: 10 };
    component.handleEventContextMenu(params);

    expect(eventsSpy.openContextMenuForEvent).toHaveBeenCalledWith(
      params.eventId,
      params.x,
      params.y,
    );
  });

  it('should remove all unscheduled events', async () => {
    eventsSpy.getUnscheduledEventsForContact.mockReturnValue(mockUnscheduledEvents);
    await fixture.whenStable();

    component.clearUnscheduledEvents();

    expect(eventsSpy.removeEvents).toHaveBeenCalledWith(mockUnscheduledEvents.map((e) => e.id));
  });

  it('should open the contacts dialog to add new contact', async () => {
    await fixture.whenStable();

    component.addNewContact();

    expect(contactsSpy.contactWithEditMenuOpen()).toBe('');
  });

  it('should open the contacts dialog to edit contact', async () => {
    const activeContact = mockContacts[0];
    contactsSpy.getActiveContact.mockReturnValue(activeContact);
    await fixture.whenStable();

    component.editContact();

    expect(contactsSpy.contactWithEditMenuOpen()).toBe(activeContact.id);
  });

  it('should delete contact', async () => {
    const activeContact = mockContacts[0];
    contactsSpy.getActiveContact.mockReturnValue(activeContact);
    await fixture.whenStable();

    component.deleteContact();

    expect(contactsSpy.removeContact).toHaveBeenCalledWith(activeContact.id);
  });

  it('should add new unscheduled events', async () => {
    component.NumNewEvent = 3;
    await fixture.whenStable();

    component.addNewEvent();

    expect(eventsSpy.addEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.any(String),
      }),
      component.NumNewEvent,
    );
  });

  afterEach(() => {
    contactsSpy.contacts.set([]);
    contactsSpy.contactWithEditMenuOpen.set(null);
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });
});
