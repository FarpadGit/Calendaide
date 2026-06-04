import { TestBed } from '@angular/core/testing';

import { EventApi } from './event.api';
import { apiSpy } from '@/../test/mockServices';
import { API } from '@/services/API/api';
import { mockEvents } from '@/../test/mocks';

describe('EventApi', () => {
  let service: EventApi;
  const mockSuccessResponse = { data: true, error: null };
  const mockErrorResponse = { data: null, error: 'mockErrorMessage' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: API, useValue: apiSpy }],
    });
    service = TestBed.inject(EventApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it.each([false, true])(
    'should send a request to create new events (server success: %s)',
    async (success) => {
      const mockResponse = success ? mockSuccessResponse : mockErrorResponse;
      apiSpy.makeRequest.mockResolvedValueOnce(mockResponse);

      const response = await service.createEvents(mockEvents);

      expect(response).toEqual(mockResponse);
      expect(apiSpy.serverResponse()?.type).toBe(success ? 'success' : 'error');
      expect(apiSpy.makeRequest).toHaveBeenCalledWith(
        '/events',
        expect.objectContaining({
          method: 'POST',
          data: { events: expect.any(Array<Object>) },
        }),
      );
    },
  );

  it.each([false, true])(
    'should send a request to update events (server success: %s)',
    async (success) => {
      const mockResponse = success ? mockSuccessResponse : mockErrorResponse;
      apiSpy.makeRequest.mockResolvedValueOnce(mockResponse);

      const response = await service.updateEvents(mockEvents);

      expect(response).toEqual(mockResponse);
      expect(apiSpy.serverResponse()?.type).toBe(success ? 'success' : 'error');
      expect(apiSpy.makeRequest).toHaveBeenCalledWith(
        '/events',
        expect.objectContaining({
          method: 'PUT',
          data: { events: expect.any(Array<Object>) },
        }),
      );
    },
  );

  it.each([false, true])(
    'should send a request to delete events (server success: %s)',
    async (success) => {
      const mockResponse = success ? mockSuccessResponse : mockErrorResponse;
      apiSpy.makeRequest.mockResolvedValueOnce(mockResponse);

      const response = await service.deleteEvents(mockEvents.map((e) => e.id));

      expect(response).toEqual(mockResponse);
      expect(apiSpy.serverResponse()?.type).toBe(success ? 'success' : 'error');
      expect(apiSpy.makeRequest).toHaveBeenCalledWith(
        '/events',
        expect.objectContaining({
          method: 'DELETE',
        }),
      );
    },
  );
});
