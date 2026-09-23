import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingToolbar } from './booking-toolbar';
import { bookingSpy } from '@/../test/mockServices';
import { Booking } from '@/services/booking';
import { mockEventSimple, mockUnscheduledEvents } from '../../../../../test/mocks';

describe('BookingToolbar', () => {
  let component: BookingToolbar;
  let fixture: ComponentFixture<BookingToolbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingToolbar],
      providers: [{ provide: Booking, useValue: bookingSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingToolbar);
    component = fixture.componentInstance;
    bookingSpy.getUnscheduledEvents.mockReturnValue([]);
  });

  function expectToBeTruthyAndVisible(element: any) {
    expect(element).toBeTruthy();
    expect(element).toBeVisible();
  }

  it('should create', async () => {
    await fixture.whenStable();

    expect(component).toBeTruthy();
  });

  it('should display a select component to choose between booking with or without a specified contact', async () => {
    await fixture.whenStable();
    const selectComponent = fixture.nativeElement.querySelector('#bookingDestinationSelect');

    expectToBeTruthyAndVisible(selectComponent);
  });

  it.each([
    [true, true],
    [true, false],
    [false, true],
    [false, false],
  ])(
    'should display a panel for authenticating against a contact if that option was selected (contact option: %s, authenticated: %s)',
    async (bookIntoContact, authenticated) => {
      component.contactData.bookIntoContact = bookIntoContact;
      component.contactData.submitResult.set(authenticated ? 'success' : null);
      await fixture.whenStable();
      const nameInput = fixture.nativeElement.querySelector('input#contactName');
      const passwordInput = fixture.nativeElement.querySelector('input#contactPassword');
      const submitButton = fixture.nativeElement.querySelector('#credentialsSubmitBtn');

      if (bookIntoContact && !authenticated) {
        expectToBeTruthyAndVisible(nameInput);
        expectToBeTruthyAndVisible(passwordInput);
        expectToBeTruthyAndVisible(submitButton);
      } else {
        expect(nameInput).toBeFalsy();
        expect(passwordInput).toBeFalsy();
        expect(submitButton).toBeFalsy();
      }
    },
  );

  it.each([
    [true, true],
    [true, false],
    [false, true],
    [false, false],
  ])(
    'should display a panel with unscheduled events, unless user is authenticating against a contact (contact option: %s, authenticated: %s)',
    async (bookIntoContact, authenticated) => {
      component.contactData.bookIntoContact = bookIntoContact;
      component.contactData.submitResult.set(authenticated ? 'success' : null);
      await fixture.whenStable();
      const eventQueue = fixture.nativeElement.querySelector('p-panel:has(.draggable-event-queue)');

      if (!bookIntoContact) {
        expectToBeTruthyAndVisible(eventQueue);
      } else if (authenticated) {
        expectToBeTruthyAndVisible(eventQueue);
      } else {
        expect(eventQueue).toBeFalsy();
      }
    },
  );

  it('should display a component for every unscheduled event', async () => {
    bookingSpy.getUnscheduledEvents.mockReturnValue(mockUnscheduledEvents);
    await fixture.whenStable();
    const events = fixture.nativeElement.querySelectorAll('app-calendar-event-content');

    expect(events.length).toBe(mockUnscheduledEvents.length);
    events.forEach((event: HTMLElement) => expect(event).toBeVisible());
  });

  it.each([true, false])(
    'should display a submit button and a component for showing the details of the currently selected event if there is any (has selected: %s)',
    async (hasSelected) => {
      bookingSpy.getSelectedEvent.mockReturnValue(hasSelected ? mockEventSimple : undefined);
      await fixture.whenStable();
      const panel: HTMLDivElement | undefined =
        fixture.nativeElement.querySelector('.event-fields');
      const titleInput = panel?.querySelector('input#title');
      const startField = panel?.querySelector('#start');
      const endField = panel?.querySelector('#end');
      const commentTextarea = panel?.querySelector('textarea#comment');
      const submitButton = fixture.nativeElement.querySelector('#submitBtn');

      if (hasSelected) {
        expectToBeTruthyAndVisible(panel);
        expectToBeTruthyAndVisible(titleInput);
        expectToBeTruthyAndVisible(startField);
        expectToBeTruthyAndVisible(endField);
        expectToBeTruthyAndVisible(commentTextarea);
        expectToBeTruthyAndVisible(submitButton);
      } else {
        expect(panel).toBeFalsy();
        expect(titleInput).toBeFalsy();
        expect(startField).toBeFalsy();
        expect(endField).toBeFalsy();
        expect(commentTextarea).toBeFalsy();
        expect(submitButton).toBeFalsy();
      }
    },
  );

  it.each([true, false])(
    'should display a success message instead of controls if user submitted a booking (submitted: %s)',
    async (submitted) => {
      component.submitResult.set(submitted ? 'success' : null);
      await fixture.whenStable();
      const successMessage: HTMLDivElement = fixture.nativeElement.querySelector('.success-msg');
      const inputs: NodeListOf<HTMLInputElement> = fixture.nativeElement.querySelectorAll('input');
      const textareas: NodeListOf<HTMLTextAreaElement> =
        fixture.nativeElement.querySelectorAll('textarea');
      const buttons: NodeListOf<HTMLButtonElement> =
        fixture.nativeElement.querySelectorAll('button');

      if (submitted) {
        expectToBeTruthyAndVisible(successMessage);
        expect(inputs.length).toBe(0);
        expect(textareas.length).toBe(0);
        expect(buttons.length).toBe(0);
      } else {
        expect(successMessage).toBeFalsy();
        expect(inputs.length).toBeGreaterThan(0);
        expect(textareas.length).toBeGreaterThan(0);
        expect(buttons.length).toBeGreaterThan(0);
      }
    },
  );

  it.each([true, false])(
    'should set the appropriate number of available unscheduled events for user (contact option: %s)',
    async (bookIntoContact) => {
      component.contactData.bookIntoContact = bookIntoContact;
      await fixture.whenStable();
      component.handleSelectChange();

      expect(component.submitResult()).toBeNull();
      if (bookIntoContact) expect(bookingSpy.setBookableEvents).toHaveBeenCalledWith([]);
      else expect(bookingSpy.setBookableEvents).not.toHaveBeenCalledWith([]);
    },
  );

  it('should format start dates to a 2-digit time string', () => {
    const date = new Date(0);
    date.setHours(7, 15);
    const result = component.toStartText(date);

    expect(result).toMatch(/07:15$/g);
  });

  it('should format end dates to a 2-digit time string with duration added from user settings', () => {
    bookingSpy.userData.settings.set({ displayName: '', bookingData: { bookingDuration: 60 } });
    const date = new Date(0);
    date.setHours(7, 15);
    const result = component.toEndText(date);

    expect(result).toMatch(/08:15$/g);
  });

  it('should reset all editable events', () => {
    component.resetScheduling();

    expect(bookingSpy.resetEvents).toHaveBeenCalled();
  });

  it.each([true, false])(
    'should submit contact credentials to server (success: %s)',
    async (success) => {
      const mockName = 'fakeName';
      const mockPassword = 'fakePassword123';
      component.contactData.name = mockName;
      component.contactData.password = mockPassword;
      const successResponse = { ids: ['fakeID1'], contactId: 'fakeContactID' };
      bookingSpy.readEventsForContact.mockResolvedValueOnce(success ? successResponse : null);
      await component.submitContactCredentials();

      expect(bookingSpy.readEventsForContact).toHaveBeenCalledWith(mockName, mockPassword);
      if (success) {
        expect(bookingSpy.setBookableEvents).toHaveBeenCalledWith(
          successResponse.ids,
          successResponse.contactId,
          mockName,
        );
        expect(component.contactData.submitResult()).toBe('success');
      } else expect(component.contactData.submitResult()).toBe('error');
    },
  );

  it.each([true, false])('should submit booking data to server (success: %s)', async (success) => {
    bookingSpy.bookEvents.mockResolvedValueOnce(success);
    bookingSpy.hasChangedEvent.mockReturnValueOnce(true);
    await component.submitBooking();

    expect(bookingSpy.bookEvents).toHaveBeenCalled();
    if (success) expect(component.submitResult()).toBe('success');
    else expect(component.submitResult()).toBe('error');
  });

  afterEach(() => {
    bookingSpy.userData.settings.set(null);
  });
});
