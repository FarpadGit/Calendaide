import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockedObject } from 'vitest';
import { userEvent } from 'vitest/browser';

import { UserSettings } from './user-settings';
import { Auth } from '@/services/auth';
import { User } from '@/services/user';
import { authSpy, userSpy } from '@/../test/mockServices';
import { ConfirmationService } from 'primeng/api';
import { of } from 'rxjs';
import { mockUser, mockUserSettings } from '../../../../../test/mocks';

describe('UserSettings', () => {
  let component: UserSettings;
  let fixture: ComponentFixture<UserSettings>;

  const confirmationSpy: Partial<MockedObject<ConfirmationService>> = {
    confirm: vi.fn().mockReturnThis(),
    requireConfirmation$: of(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserSettings],
      providers: [
        { provide: Auth, useValue: authSpy },
        { provide: User, useValue: userSpy },
      ],
    })
      .overrideComponent(UserSettings, {
        remove: { providers: [ConfirmationService] },
        add: { providers: [{ provide: ConfirmationService, useValue: confirmationSpy }] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(UserSettings);
    component = fixture.componentInstance;
    authSpy.isDemoUser.mockReturnValue(false);
  });

  function expectToBeTruthyAndVisible(element: any) {
    expect(element).toBeTruthy();
    expect(element).toBeVisible();
  }

  it('should create', async () => {
    await fixture.whenStable();

    expect(component).toBeTruthy();
  });

  it.each([false, true])(
    'should display form controls to change save mode, display name, business hours, external booking and controls to change password and delete account if user is not demo user',
    async (isDemoUser) => {
      authSpy.isDemoUser.mockReturnValue(isDemoUser);
      await fixture.whenStable();

      const {
        saveModeSelect,
        businessHoursButton,
        bookingSwitch,
        displaynameInput,
        passwordElement,
        deleteAccountButton,
        submitButton,
      } = getFormControls(fixture);

      expectToBeTruthyAndVisible(saveModeSelect);
      expectToBeTruthyAndVisible(businessHoursButton);
      expectToBeTruthyAndVisible(bookingSwitch);
      expectToBeTruthyAndVisible(displaynameInput);
      if (isDemoUser) expect(passwordElement).toBeFalsy();
      else expectToBeTruthyAndVisible(passwordElement);
      if (isDemoUser) expect(deleteAccountButton).toBeFalsy();
      else expectToBeTruthyAndVisible(deleteAccountButton);
      expectToBeTruthyAndVisible(submitButton);
    },
  );
  it('should display all form controls and fill them if optional settings are set for user', async () => {
    const settings: typeof mockUserSettings = {
      saveMode: 'manual',
      businessHours: [
        {
          daysOfWeek: [1, 2, 3],
          startTime: '09:00',
          endTime: '17:00',
        },
        {
          daysOfWeek: [4, 5],
          startTime: '10:00',
          endTime: '14:00',
        },
      ],
      bookingData: {
        bookingEnabled: true,
        bookingId: 'fakeBookingId',
        bookingDuration: 100,
      },
    };
    userSpy.getUserSettings.mockReturnValueOnce(settings);
    userSpy.currentUserData.user.set({ ...mockUser, settings });
    await fixture.whenStable();

    const {
      saveModeSelect,
      businessHoursButton,
      bookingSwitch,
      displaynameInput,
      passwordElement,
      deleteAccountButton,
      submitButton,
      others,
    } = getFormControls(fixture, true);
    const { businessHours, bookingIdInput, bookingDurationInput } = others;

    expectToBeTruthyAndVisible(saveModeSelect);
    expectToBeTruthyAndVisible(businessHoursButton);
    expectToBeTruthyAndVisible(bookingSwitch);
    expectToBeTruthyAndVisible(displaynameInput);
    expectToBeTruthyAndVisible(passwordElement);
    expectToBeTruthyAndVisible(deleteAccountButton);
    expectToBeTruthyAndVisible(submitButton);
    businessHours?.forEach((group) => {
      expectToBeTruthyAndVisible(group.weekDayPicker);
      expectToBeTruthyAndVisible(group.startHourPicker);
      expectToBeTruthyAndVisible(group.endHourPicker);
      expectToBeTruthyAndVisible(group.deleteButton);
    });
    expectToBeTruthyAndVisible(bookingIdInput);
    expectToBeTruthyAndVisible(bookingDurationInput);

    const { displayName, userSettings } = component.settingsForm.value;
    expect(displayName).toBe(mockUser.displayname);
    userSettings?.businessHours?.forEach((bh, i) => {
      const expectedDays = settings.businessHours[i].daysOfWeek.map((d) => d - 1);
      const expectedStart = new Date('1970-' + settings.businessHours[i].startTime);
      const expectedEnd = new Date('1970-' + settings.businessHours[i].endTime);
      expect(bh.daysOfWeek).toEqual(expectedDays);
      expect(bh.startTime).toEqual(expectedStart);
      expect(bh.endTime).toEqual(expectedEnd);
    });
    expect(userSettings?.bookingData?.bookingEnabled).toBe(settings.bookingData.bookingEnabled);
    expect(userSettings?.bookingData?.bookingId).toBe(settings.bookingData.bookingId);
    expect(userSettings?.bookingData?.bookingDuration).toBe(settings.bookingData.bookingDuration);
  });

  it('should disable all form controls if user is demo user', async () => {
    authSpy.isDemoUser.mockReturnValue(true);
    await fixture.whenStable();

    const { saveModeButtons, businessHoursButton, bookingSwitch, displaynameInput, submitButton } =
      getFormControls(fixture);

    saveModeButtons.forEach((button) =>
      // primeng select buttons are not real buttons with a disable property
      expect(button).toHaveAttribute('data-p-disabled'),
    );
    expect(businessHoursButton).toBeDisabled();
    expect(bookingSwitch).toBeDisabled();
    expect(displaynameInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it('should save new user settings', async () => {
    await fixture.whenStable();
    const displayname = 'New Mock Username';
    const password = 'NewMockPassword123';
    const { saveModeSelect, displaynameInput, submitButton } = getFormControls(fixture);
    const manualModeButton = saveModeSelect.querySelectorAll('p-togglebutton')[1];
    const passwordToggle = fixture.nativeElement.querySelector('#password-inplace-toggle');

    await userEvent.click(manualModeButton);
    await userEvent.type(displaynameInput, displayname);
    await userEvent.click(passwordToggle);
    const passwordInput = fixture.nativeElement.querySelector('input#password');
    await userEvent.type(passwordInput, password);
    await userEvent.click(submitButton);

    expect(userSpy.saveUserSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        displayname,
        password,
        settings: { ...mockUserSettings, saveMode: 'manual' },
      }),
    );
  });

  it('should open a confirm dialog if Delete Account button is clicked', async () => {
    await fixture.whenStable();
    const deleteAccountButton = fixture.nativeElement.querySelector('#delete-account-btn');

    await userEvent.click(deleteAccountButton);

    expect(confirmationSpy.confirm).toHaveBeenCalled();
  });

  afterEach(() => {
    userSpy.currentUserData.user.set(null);
  });
});

function getFormControls(fixture: ComponentFixture<UserSettings>, all: boolean = false) {
  const root = fixture.nativeElement;
  const saveModeSelect: HTMLElement = root.querySelector('p-selectbutton#savemode');
  const saveModeButtons: NodeListOf<HTMLButtonElement> =
    saveModeSelect.querySelectorAll('p-togglebutton');
  const businessHoursButton: HTMLButtonElement = root.querySelector('#business-hours-add');
  const bookingSwitch: HTMLInputElement = root.querySelector('p-toggleswitch #bookingEnabled');
  const displaynameInput: HTMLInputElement = root.querySelector('input#displayname');
  const passwordElement: HTMLInputElement = root.querySelector('[id*="password"]');
  const deleteAccountButton: HTMLButtonElement = root.querySelector('#delete-account-btn button');
  const submitButton: HTMLButtonElement = root.querySelector('#submit-btn button');
  let others = {} as {
    businessHours?: {
      weekDayPicker: HTMLElement;
      startHourPicker: HTMLElement;
      endHourPicker: HTMLElement;
      deleteButton: HTMLButtonElement;
    }[];
    bookingIdInput?: HTMLInputElement;
    bookingDurationInput?: HTMLInputElement;
  };

  if (all) {
    const businessHours = [] as NonNullable<typeof others.businessHours>;
    const group: NodeListOf<HTMLDivElement> = root.querySelectorAll('.business-hours');
    group.forEach((div) => {
      const weekDayPicker: HTMLElement = div.querySelector('[id*="business-days_"]')!;
      const startHourPicker: HTMLElement = div.querySelector('[id*="business-hours-start_"]')!;
      const endHourPicker: HTMLElement = div.querySelector('[id*="business-hours-end_"]')!;
      const deleteButton: HTMLButtonElement = div.querySelector('button')!;
      businessHours.push({ weekDayPicker, startHourPicker, endHourPicker, deleteButton });
    });

    const bookingIdInput: HTMLInputElement = root.querySelector('input#bookingId');
    const bookingDurationInput: HTMLInputElement = root.querySelector('input#bookingDuration');

    others = { businessHours, bookingIdInput, bookingDurationInput };
  }

  return {
    saveModeSelect,
    saveModeButtons,
    businessHoursButton,
    bookingSwitch,
    displaynameInput,
    passwordElement,
    deleteAccountButton,
    submitButton,
    others,
  };
}
