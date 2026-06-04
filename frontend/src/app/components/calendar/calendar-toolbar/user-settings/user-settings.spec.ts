import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockedObject } from 'vitest';
import { userEvent } from 'vitest/browser';

import { UserSettings } from './user-settings';
import { Auth } from '@/services/auth';
import { User } from '@/services/user';
import { authSpy, userSpy } from '@/../test/mockServices';
import { ConfirmationService } from 'primeng/api';
import { of } from 'rxjs';

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

  it('should create', async () => {
    await fixture.whenStable();
    expect(component).toBeTruthy();
  });

  it.each([false, true])(
    'should display form controls to change save mode and display name, and dynamic controls to change password and delete account if user is not demo user',
    async (isDemoUser) => {
      authSpy.isDemoUser.mockReturnValue(isDemoUser);
      await fixture.whenStable();

      const saveModeSelect = fixture.nativeElement.querySelector('p-selectbutton#savemode');
      const displaynameInput = fixture.nativeElement.querySelector('input#displayname');
      const passwordElement = fixture.nativeElement.querySelector('[id*="password"]');
      const deleteAccountButton = fixture.nativeElement.querySelector('#delete-account-btn');
      const submitButton = fixture.nativeElement.querySelector('#submit-btn button');

      expect(saveModeSelect).toBeTruthy();
      expect(saveModeSelect).toBeVisible();
      expect(displaynameInput).toBeTruthy();
      expect(displaynameInput).toBeVisible();
      if (isDemoUser) expect(passwordElement).toBeFalsy();
      else {
        expect(passwordElement).toBeTruthy();
        expect(passwordElement).toBeVisible();
      }
      if (isDemoUser) expect(deleteAccountButton).toBeFalsy();
      else {
        expect(deleteAccountButton).toBeTruthy();
        expect(deleteAccountButton).toBeVisible();
      }
      expect(submitButton).toBeTruthy();
      expect(submitButton).toBeVisible();
    },
  );

  it('should disable all form controls if user is demo user', async () => {
    authSpy.isDemoUser.mockReturnValue(true);
    await fixture.whenStable();

    const saveModeSelect = fixture.nativeElement.querySelector('p-selectbutton#savemode');
    const saveModeButtons = saveModeSelect.querySelectorAll('p-togglebutton');
    const displaynameInput = fixture.nativeElement.querySelector('input#displayname');
    const submitButton = fixture.nativeElement.querySelector('#submit-btn button');

    saveModeButtons.forEach((button: HTMLElement) =>
      expect(button).toHaveAttribute('data-p-disabled'),
    );
    expect(displaynameInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it('should save new user settings', async () => {
    await fixture.whenStable();
    const displayname = 'New Mock Username';
    const password = 'NewMockPassword123';
    const saveModeSelect = fixture.nativeElement.querySelector('p-selectbutton#savemode');
    const manualModeButton = saveModeSelect.querySelectorAll('p-togglebutton')[1];
    const displaynameInput = fixture.nativeElement.querySelector('input#displayname');
    const passwordToggle = fixture.nativeElement.querySelector('#password-inplace-toggle');
    const submitButton = fixture.nativeElement.querySelector('#submit-btn button');

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
        settings: { saveMode: 'manual' },
      }),
    );
  });

  it('should open a confirm dialog if Delete Account button is clicked', async () => {
    await fixture.whenStable();
    const deleteAccountButton = fixture.nativeElement.querySelector('#delete-account-btn');

    await userEvent.click(deleteAccountButton);

    expect(confirmationSpy.confirm).toHaveBeenCalled();
  });
});
