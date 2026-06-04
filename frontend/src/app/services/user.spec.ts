import { TestBed } from '@angular/core/testing';

import { User } from './user';
import { UserApi } from '@/services/API/user.api';
import { mockUser } from '@/../test/mocks';
import { userApiSpy } from '@/../test/mockServices';
import { userSettings } from '@/types.usersettings';

describe('User', () => {
  let service: User;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: UserApi, useValue: userApiSpy }],
    });
    service = TestBed.inject(User);
    service.currentUserData.user.set({ ...mockUser } as ReturnType<
      typeof service.currentUserData.user
    >);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return the user settings object', () => {
    expect(service.getUserSettings()).toEqual(mockUser.settings);
  });

  it('should return the default user settings if no user object exists', () => {
    service.currentUserData.user.set(null);

    expect(service.getUserSettings()).toEqual({ saveMode: 'auto' });
  });

  it('should save new user settings locally and send request to server', async () => {
    const mockNewUserSettings = {
      displayname: 'Fake Name',
      password: 'fakepassword123',
      settings: { saveMode: 'manual' } as userSettings,
    };
    service.saveUserSettings(mockNewUserSettings);
    const user = service.currentUserData.user();

    expect(user?.displayname).toEqual(mockNewUserSettings.displayname);
    expect(user?.settings).toEqual(mockNewUserSettings.settings);
    expect(userApiSpy.updateUser).toHaveBeenCalledWith(
      expect.objectContaining(mockNewUserSettings),
    );
  });

  it('should send a request to server to save all user data', async () => {
    service.saveAll();

    expect(userApiSpy.saveAllUserData).toHaveBeenCalledWith(
      service.currentUserData.user(),
      service.currentUserData.contacts(),
      service.currentUserData.events(),
    );
  });

  it('should send a request to server to delete user', async () => {
    await service.deleteUser();

    expect(userApiSpy.deleteUser).toHaveBeenCalled();
  });
});
