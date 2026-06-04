import { TestBed } from '@angular/core/testing';

import { ContactApi } from './contact.api';
import { apiSpy } from '@/../test/mockServices';
import { API } from '@/services/API/api';
import { mockContacts } from '@/../test/mocks';

describe('ContactApi', () => {
  let service: ContactApi;
  const mockSuccessResponse = { data: true, error: null };
  const mockErrorResponse = { data: null, error: 'mockErrorMessage' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: API, useValue: apiSpy }],
    });
    service = TestBed.inject(ContactApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it.each([false, true])(
    'should send a request to create a new contact (server success: %s)',
    async (success) => {
      const mockResponse = success ? mockSuccessResponse : mockErrorResponse;
      apiSpy.makeRequest.mockResolvedValueOnce(mockResponse);

      const response = await service.createContact(mockContacts[0]);

      expect(response).toEqual(mockResponse);
      expect(apiSpy.serverResponse()?.type).toBe(success ? 'success' : 'error');
      expect(apiSpy.makeRequest).toHaveBeenCalledWith(
        '/contacts',
        expect.objectContaining({
          method: 'POST',
          data: mockContacts[0],
        }),
      );
    },
  );

  it.each([false, true])(
    'should send a request to update a contact (server success: %s)',
    async (success) => {
      const mockResponse = success ? mockSuccessResponse : mockErrorResponse;
      apiSpy.makeRequest.mockResolvedValueOnce(mockResponse);
      const mockUpdate: Parameters<typeof service.updateContact>[1] = { name: 'Updated Name' };

      const response = await service.updateContact(mockContacts[0].id, mockUpdate);

      expect(response).toEqual(mockResponse);
      expect(apiSpy.serverResponse()?.type).toBe(success ? 'success' : 'error');
      expect(apiSpy.makeRequest).toHaveBeenCalledWith(
        `/contacts/${mockContacts[0].id}`,
        expect.objectContaining({
          method: 'PUT',
          data: mockUpdate,
        }),
      );
    },
  );

  it.each([false, true])(
    'should send a request to delete a contact (server success: %s)',
    async (success) => {
      const mockResponse = success ? mockSuccessResponse : mockErrorResponse;
      apiSpy.makeRequest.mockResolvedValueOnce(mockResponse);

      const response = await service.deleteContact(mockContacts[0].id);

      expect(response).toEqual(mockResponse);
      expect(apiSpy.serverResponse()?.type).toBe(success ? 'success' : 'error');
      expect(apiSpy.makeRequest).toHaveBeenCalledWith(
        `/contacts/${mockContacts[0].id}`,
        expect.objectContaining({
          method: 'DELETE',
        }),
      );
    },
  );
});
