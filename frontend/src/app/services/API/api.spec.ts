import { TestBed } from '@angular/core/testing';

import { API } from './api';
import { mockUser } from '@/../test/mocks';
import axios from 'axios';

type mockedAxiosType = typeof axios & { callAxiosSpy: ReturnType<typeof vi.fn> };

describe('API', () => {
  let service: API;

  const mockAxios = vi.mocked(axios);
  const callAxiosSpy = vi.mocked(axios as mockedAxiosType).callAxiosSpy;
  const mockAxiosResponse = { mock: true };
  const mockAxiosError = { response: { status: 500 } };
  const mockServerLoginResponse: Required<Awaited<ReturnType<API['login']>>> = {
    user: mockUser,
    contacts: [],
    events: [],
    token: 'fakeToken',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(API);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it.each([false, true])(
    'should make a generic parameterized request to server (server success: %s)',
    async (success) => {
      if (success) callAxiosSpy.mockResolvedValueOnce({ data: mockAxiosResponse });
      else callAxiosSpy.mockRejectedValueOnce({ error: mockAxiosError });

      const response = await service.makeRequest('/fake-endpoint', { method: 'POST' });

      if (success) expect(response).toEqual({ data: mockAxiosResponse, error: null });
      else expect(response).toEqual({ error: expect.any(String), data: null });
    },
  );

  it('should set the Authorization header for Axios requests', () => {
    const mockBearerToken = 'mockToken';

    service.setBearer(mockBearerToken);

    expect(mockAxios.defaults.headers.common.Authorization).toBe('Bearer ' + mockBearerToken);
  });

  it('should revoke the Authorization header from Axios requests', () => {
    service.setBearer('mockToken');

    service.revokeBearer();

    expect(mockAxios.defaults.headers.common.Authorization).toBeUndefined();
  });

  it.each([false, true])(
    'should make a request to authenticate user with server (server success: %s)',
    async (success) => {
      if (success) callAxiosSpy.mockResolvedValueOnce({ data: mockServerLoginResponse });
      else callAxiosSpy.mockRejectedValueOnce({ error: mockAxiosError });
      const makeRequestSpy = vi.spyOn(service, 'makeRequest');

      const response = await service.login('fake.email@mail.com', 'fakepassword123');

      expect(makeRequestSpy).toHaveBeenCalledWith(
        '/auth/login',
        expect.objectContaining({
          method: 'POST',
          data: expect.objectContaining({ ciphertext: expect.any(String), iv: expect.any(String) }),
        }),
      );
      if (success) expect(response).toEqual(mockServerLoginResponse);
      else expect(response).toBeNull();
    },
  );

  it.each([false, true])(
    'should make a request to authenticate an oauth bearing user with server (server success: %s)',
    async (success) => {
      if (success) callAxiosSpy.mockResolvedValueOnce({ data: mockServerLoginResponse });
      else callAxiosSpy.mockRejectedValueOnce({ error: mockAxiosError });
      const makeRequestSpy = vi.spyOn(service, 'makeRequest');

      const response = await service.loginWithGoogle('fake.email@mail.com', 'Fake User', '00000');

      expect(makeRequestSpy).toHaveBeenCalledWith(
        '/auth/login/google',
        expect.objectContaining({
          method: 'POST',
          data: expect.objectContaining({ ciphertext: expect.any(String), iv: expect.any(String) }),
        }),
      );
      if (success) expect(response).toEqual(mockServerLoginResponse);
      else expect(response).toBeNull();
    },
  );

  it.each([false, true])(
    'should make a request to reauthenticate a user with active session with server (server success: %s)',
    async (success) => {
      if (success) callAxiosSpy.mockResolvedValueOnce({ data: mockServerLoginResponse });
      else callAxiosSpy.mockRejectedValueOnce({ error: mockAxiosError });
      const makeRequestSpy = vi.spyOn(service, 'makeRequest');

      const response = await service.refresh();

      expect(makeRequestSpy).toHaveBeenCalledWith(
        '/auth/refresh',
        expect.objectContaining({ method: 'POST' }),
      );
      if (success) expect(response).toEqual(mockServerLoginResponse);
      else expect(response).toBeNull();
    },
  );

  it('should make a request to log out a user with server', async () => {
    callAxiosSpy.mockResolvedValueOnce({ data: mockAxiosResponse });
    const makeRequestSpy = vi.spyOn(service, 'makeRequest');

    await service.logout();

    expect(makeRequestSpy).toHaveBeenCalledWith(
      '/auth/logout',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
