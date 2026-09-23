import { TestBed } from '@angular/core/testing';

import { BookingApi } from './booking.api';
import { apiSpy } from '@/../test/mockServices';
import { API } from '@/services/API/api';
import { mockEvents, mockEventSimple, mockResponse, mockUserSettings } from '../../../test/mocks';

describe('BookingApi', () => {
  let service: BookingApi;
  const mockSuccessResponse = mockResponse({
    settings: mockUserSettings,
    events: [{ ...mockEventSimple, recurrenceData: null }],
  });
  const mockErrorResponse = mockResponse(null, 'mockErrorMessage');
  const mockBookingID = 'fakeBookingId';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: API, useValue: apiSpy }],
    });
    service = TestBed.inject(BookingApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it.each([false, true])(
    'should send a request to read scheduled events belonging to a user (server success: %s)',
    async (success) => {
      const mockResponse = success ? mockSuccessResponse : mockErrorResponse;
      apiSpy.makeRequest.mockResolvedValueOnce(mockResponse);

      const response = await service.readEvents(mockBookingID);

      if (success)
        expect(response).toEqual(
          expect.objectContaining({ ...mockResponse.data, events: [mockEventSimple] }),
        );
      else expect(response).toBeNull();
      expect(apiSpy.makeRequest).toHaveBeenCalledWith(`/booking/${mockBookingID}`);
    },
  );

  it.each([false, true])(
    "should send a request to read unscheduled events belonging to a user's contact (server success: %s)",
    async (success) => {
      const mockResponse = success ? mockSuccessResponse : mockErrorResponse;
      apiSpy.makeRequest.mockResolvedValueOnce(mockResponse);
      const mockContactName = 'fake contact';
      const mockContactPassword = 'fakePassword123';

      const response = await service.readEventsForContact(
        mockBookingID,
        mockContactName,
        mockContactPassword,
      );

      if (success) expect(response).toEqual(mockResponse.data);
      else expect(response).toBeNull();
      expect(apiSpy.makeRequest).toHaveBeenCalledWith(
        `/booking/${mockBookingID}/contacts`,
        expect.objectContaining({
          method: 'POST',
          data: { name: mockContactName, password: mockContactPassword },
        }),
      );
    },
  );

  it.each([false, true])(
    'should send a request to book an appointment (server success: %s)',
    async (success) => {
      const mockResponse = success ? mockSuccessResponse : mockErrorResponse;
      apiSpy.makeRequest.mockResolvedValueOnce(mockResponse);

      const response = await service.bookEvents(mockBookingID, mockEvents);

      expect(response).toEqual(success);
      expect(apiSpy.makeRequest).toHaveBeenCalledWith(
        `/booking/${mockBookingID}`,
        expect.objectContaining({
          method: 'POST',
          data: { events: mockEvents },
        }),
      );
    },
  );
});
