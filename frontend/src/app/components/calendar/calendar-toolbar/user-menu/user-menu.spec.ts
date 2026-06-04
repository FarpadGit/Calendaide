import { ComponentFixture, TestBed } from '@angular/core/testing';
import { page, userEvent } from 'vitest/browser';

import { UserMenu } from './user-menu';
import { Auth } from '@/services/auth';
import { User } from '@/services/user';
import { authSpy, userSpy } from '@/../test/mockServices';
import { mockUser } from '@/../test/mocks';

describe('UserMenu', () => {
  let component: UserMenu;
  let fixture: ComponentFixture<UserMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserMenu],
      providers: [
        { provide: Auth, useValue: authSpy },
        { provide: User, useValue: userSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserMenu);
    component = fixture.componentInstance;
    userSpy.currentUserData.user.set(mockUser as ReturnType<User['currentUserData']['user']>);
  });

  it('should create', async () => {
    await fixture.whenStable();

    expect(component).toBeTruthy();
  });

  it('should display the displayname and avatar circle for the logged in user', async () => {
    await fixture.whenStable();
    const displayname = page.getByText(component.displayname);
    const avatar = fixture.nativeElement.querySelector('p-avatar');

    expect(displayname).toBeTruthy();
    expect(displayname).toBeVisible();
    expect(avatar).toBeTruthy();
    expect(avatar).toBeVisible();
  });

  it.each(['auto', 'manual'] as const)(
    'should display a Manual Save button if user save mode is set to "manual" (save mode: %s)',
    async (saveMode) => {
      userSpy.getUserSettings.mockReturnValue({ saveMode });
      await fixture.whenStable();

      const saveButton = fixture.nativeElement.querySelector('#manual-save-btn button');

      if (saveMode === 'auto') expect(saveButton).toBeFalsy();
      else {
        expect(saveButton).toBeTruthy();
        expect(saveButton).toBeVisible();
      }
    },
  );
  it('should send request to service to manually save all user data', async () => {
    userSpy.getUserSettings.mockReturnValue({ saveMode: 'manual' });
    await fixture.whenStable();
    const saveButton = fixture.nativeElement.querySelector('#manual-save-btn button');

    await userEvent.click(saveButton);

    expect(userSpy.saveAll).toHaveBeenCalled();
  });

  it('should log out user', async () => {
    await fixture.whenStable();

    await component.handleLogout();

    expect(authSpy.logoutUser).toHaveBeenCalled();
  });
});
