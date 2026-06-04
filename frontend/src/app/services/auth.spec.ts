import { TestBed } from '@angular/core/testing';
import { MockedObject } from 'vitest';

import { Auth } from './auth';
import { Router } from '@angular/router';
import { API } from '@/services/API/api';
import { UserApi } from '@/services/API/user.api';
import { User } from '@/services/user';
import { apiSpy, routerSpy, userApiSpy, userSpy } from '@/../test/mockServices';
import { mockUser } from '@/../test/mocks';
import { demoUserData } from '@/utils/demo';
import { OAuthSuccessEvent, OAuthService } from 'angular-oauth2-oidc';
import { Subject } from 'rxjs';

describe('Auth', () => {
  let service: Auth;
  const oAuthSpy: Partial<MockedObject<OAuthService>> = {
    configure: vi.fn(),
    setupAutomaticSilentRefresh: vi.fn(),
    loadDiscoveryDocumentAndTryLogin: vi.fn(),
    events: new Subject(),
    getIdentityClaims: vi.fn(),
    hasValidAccessToken: vi.fn(),
    initCodeFlow: vi.fn(),
    revokeTokenAndLogout: vi.fn(),
  };

  const mockServerLoginResponse: Required<Awaited<ReturnType<API['login']>>> = {
    user: mockUser,
    contacts: [],
    events: [],
    token: 'fakeToken',
  };

  // same as auth service private values
  const sessionStorageKey = '_session';
  const demoUserToken = 'DemoUser';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: API, useValue: apiSpy },
        { provide: OAuthService, useValue: oAuthSpy },
        { provide: UserApi, useValue: userApiSpy },
        { provide: User, useValue: userSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });
    service = TestBed.inject(Auth);
    userSpy.currentUserData.user.set({ ...mockUser } as ReturnType<
      typeof userSpy.currentUserData.user
    >);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it.each(['session storage', 'oauth token', '(neither)'])(
    'should authenticate user if session info is stored in %s',
    (type) => {
      if (type === 'session storage') sessionStorage.setItem(sessionStorageKey, 'FakeSessionID');
      else sessionStorage.removeItem(sessionStorageKey);
      oAuthSpy.hasValidAccessToken!.mockReturnValueOnce(type === 'oauth token');

      const result = service.authenticate();

      if (type !== '(neither)') expect(result).toBe(true);
      else expect(result).toBe(false);
    },
  );

  it.each([false, true])(
    'should return if logged in user is Demo user or not (%s)',
    (isDemoUser) => {
      sessionStorage.setItem(sessionStorageKey, isDemoUser ? demoUserToken : 'wrongToken');

      expect(service.isDemoUser()).toBe(isDemoUser);
    },
  );

  it.each([
    [false, 'manual', false],
    [false, 'auto', true],
    [true, 'manual', false],
    [true, 'auto', false],
  ])(
    'should return if actions can be automatically sent over to server (demo user: %s, save mode: %s, expected value: %s)',
    (isDemo, saveMode, expected) => {
      if (isDemo) sessionStorage.setItem(sessionStorageKey, demoUserToken);
      else sessionStorage.removeItem(sessionStorageKey);
      if (saveMode === 'auto') userSpy.getUserSettings.mockReturnValueOnce({ saveMode: 'auto' });
      else userSpy.getUserSettings.mockReturnValueOnce({ saveMode: 'manual' });

      expect(service.canAutosaveToServer()).toBe(expected);
    },
  );

  it.each([false, true])('should register a new user (server success: %s)', async (success) => {
    const mockEmail = 'fake.email@mail.com';
    const mockPassword = 'fakepassword123';
    if (success) {
      userApiSpy.createUser.mockResolvedValueOnce({ data: true, error: null });
      apiSpy.login.mockResolvedValueOnce(mockServerLoginResponse);
    } else {
      userApiSpy.createUser.mockResolvedValueOnce({ data: null, error: 'mockErrorMessage' });
    }

    const result = await service.registerUser(mockEmail, mockPassword);

    expect(userApiSpy.createUser).toHaveBeenCalledWith(mockEmail, mockPassword);
    expect(result).toBe(success);
    if (success) {
      expect(apiSpy.login).toHaveBeenCalledWith(mockEmail, mockPassword);
      expect(sessionStorage.getItem(sessionStorageKey)).toBe(mockServerLoginResponse.token);
    } else {
      expect(apiSpy.login).not.toHaveBeenCalled();
      expect(sessionStorage.getItem(sessionStorageKey)).toBeNull();
    }
  });

  it.each([false, true])(
    'should login a user with credentials (server success: %s)',
    async (success) => {
      const mockEmail = 'fake.email@mail.com';
      const mockPassword = 'fakepassword123';
      apiSpy.login.mockResolvedValueOnce(success ? mockServerLoginResponse : null);

      const result = await service.loginUser(mockEmail, mockPassword);

      expect(apiSpy.login).toHaveBeenCalledWith(mockEmail, mockPassword);
      expect(result).toBe(success);
      if (success) {
        expect(userSpy.currentUserData.setUser).toHaveBeenCalledWith(mockServerLoginResponse.user);
        expect(userSpy.currentUserData.contacts()).toEqual(mockServerLoginResponse.contacts);
        expect(userSpy.currentUserData.events()).toEqual(mockServerLoginResponse.events);
        expect(sessionStorage.getItem(sessionStorageKey)).toBe(mockServerLoginResponse.token);
      } else {
        expect(userSpy.currentUserData.setUser).not.toHaveBeenCalled();
        expect(sessionStorage.getItem(sessionStorageKey)).toBeNull();
      }
    },
  );

  it('should initiate a login flow with google', () => {
    service.loginUserWithGoogle();

    expect(oAuthSpy.initCodeFlow).toHaveBeenCalled();
  });

  it.each([false, true])(
    'should reauthenticate a user with server or log them out on failure (server success: %s)',
    async (success) => {
      sessionStorage.setItem(sessionStorageKey, mockServerLoginResponse.token);
      apiSpy.refresh.mockResolvedValueOnce(success ? mockServerLoginResponse : null);

      await service.refreshUser();

      expect(apiSpy.refresh).toHaveBeenCalled();
      if (success) {
        expect(userSpy.currentUserData.setUser).toHaveBeenCalledWith(mockServerLoginResponse.user);
        expect(userSpy.currentUserData.contacts()).toEqual(mockServerLoginResponse.contacts);
        expect(userSpy.currentUserData.events()).toEqual(mockServerLoginResponse.events);
        expect(apiSpy.logout).not.toHaveBeenCalled();
      } else {
        expect(userSpy.currentUserData.user()).toBe(null);
        expect(userSpy.currentUserData.contacts()).toEqual([]);
        expect(userSpy.currentUserData.events()).toEqual([]);
        expect(apiSpy.logout).toHaveBeenCalled();
      }
    },
  );

  it('should login a user as demo user', () => {
    service.loginToDemo();

    expect(userSpy.currentUserData.setUser).toHaveBeenCalledWith(demoUserData.user);
    expect(userSpy.currentUserData.contacts()).toEqual(demoUserData.contacts);
    expect(userSpy.currentUserData.events()).toEqual(demoUserData.events);
    expect(sessionStorage.getItem(sessionStorageKey)).toBe(demoUserToken);
  });

  it.each(['demo', 'credentials authenticated', 'google authenticated'])(
    'should log out a %s user',
    async (user) => {
      if (user === 'google authenticated')
        oAuthSpy.hasValidAccessToken!.mockResolvedValueOnce(true);

      await service.logoutUser();

      expect(userSpy.currentUserData.user()).toBe(null);
      expect(userSpy.currentUserData.contacts()).toEqual([]);
      expect(userSpy.currentUserData.events()).toEqual([]);
      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/login');
      expect(sessionStorage.getItem(sessionStorageKey)).toBe(null);
      if (user === 'credentials authenticated') expect(apiSpy.logout).toHaveBeenCalled();
      if (user === 'google authenticated') {
        expect(oAuthSpy.revokeTokenAndLogout).toHaveBeenCalled();
        expect(apiSpy.logout).toHaveBeenCalled();
      }
    },
  );

  it.each([false, true])(
    'should authenticate a user with a valid google oauth token (server success: %s)',
    async (success) => {
      const mockIdentities = { email: 'fake.email@mail.com', name: 'Fake User', sub: '00000' };
      oAuthSpy.getIdentityClaims!.mockReturnValue(mockIdentities);
      apiSpy.loginWithGoogle.mockResolvedValue(success ? mockServerLoginResponse : null);
      const logoutSpy = vi.spyOn(service, 'logoutUser');

      (oAuthSpy.events as Subject<OAuthSuccessEvent>).next(new OAuthSuccessEvent('token_received'));

      await vi.waitFor(() => {
        expect(apiSpy.loginWithGoogle).toHaveBeenCalledWith(
          mockIdentities.email,
          mockIdentities.name,
          mockIdentities.sub,
        );
        if (success) {
          expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/');
          expect(logoutSpy).not.toHaveBeenCalled();
        } else {
          expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/login');
          expect(logoutSpy).toHaveBeenCalled();
        }
      });
    },
  );

  afterEach(() => {
    sessionStorage.removeItem(sessionStorageKey);
  });
});
