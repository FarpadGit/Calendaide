import { TestBed } from '@angular/core/testing';

import { UserApi } from './user.api';
import { apiSpy } from '@/../test/mockServices';
import { API } from '@/services/API/api';
import { mockContacts, mockEvents, mockUser } from '@/../test/mocks';

describe('UserApi', () => {
  let service: UserApi;
  const mockSuccessResponse = { data: true, error: null };
  const mockErrorResponse = { data: null, error: 'mockErrorMessage' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: API, useValue: apiSpy }],
    });
    service = TestBed.inject(UserApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it.each([false, true])(
    'should send a request to create a new user (server success: %s)',
    async (success) => {
      const mockResponse = success ? mockSuccessResponse : mockErrorResponse;
      apiSpy.makeRequest.mockResolvedValueOnce(mockResponse);

      const response = await service.createUser('fake.email@mail.com', 'fakepassword123');

      expect(response).toEqual(mockResponse);
      expect(apiSpy.makeRequest).toHaveBeenCalledWith(
        '/auth/register',
        expect.objectContaining({
          method: 'POST',
          data: expect.objectContaining({ ciphertext: expect.any(String), iv: expect.any(String) }),
        }),
      );
    },
  );

  it.each([false, true])(
    'should send a request to update a user (server success: %s)',
    async (success) => {
      const mockResponse = success ? mockSuccessResponse : mockErrorResponse;
      apiSpy.makeRequest.mockResolvedValueOnce(mockResponse);

      const response = await service.updateUser({ displayname: 'Updated Name' });

      expect(response).toEqual(mockResponse);
      expect(apiSpy.serverResponse()?.type).toBe(success ? 'success' : 'error');
      expect(apiSpy.makeRequest).toHaveBeenCalledWith(
        '/users',
        expect.objectContaining({
          method: 'PUT',
          data: expect.objectContaining({ ciphertext: expect.any(String), iv: expect.any(String) }),
        }),
      );
    },
  );

  it.each([false, true])(
    'should send a request to delete a user (server success: %s)',
    async (success) => {
      const mockResponse = success ? mockSuccessResponse : mockErrorResponse;
      apiSpy.makeRequest.mockResolvedValueOnce(mockResponse);

      const response = await service.deleteUser();

      expect(response).toEqual(mockResponse);
      expect(apiSpy.makeRequest).toHaveBeenCalledWith(
        '/users',
        expect.objectContaining({
          method: 'DELETE',
        }),
      );
    },
  );

  it.each([false, true])(
    'should send a request to save all user data (server success: %s)',
    async (success) => {
      const mockResponse = success ? mockSuccessResponse : mockErrorResponse;
      apiSpy.makeRequest.mockResolvedValueOnce(mockResponse);

      const response = await service.saveAllUserData(mockUser, mockContacts, mockEvents);

      expect(response).toEqual(mockResponse);
      expect(apiSpy.serverResponse()?.type).toBe(success ? 'success' : 'error');
      expect(apiSpy.makeRequest).toHaveBeenCalledWith(
        '/users/userdata',
        expect.objectContaining({
          method: 'POST',
          data: expect.any(Object),
        }),
      );
    },
  );
});
