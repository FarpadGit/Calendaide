import { inject, Injectable } from '@angular/core';
import { API } from '@/services/API/api';
import { parseEventData } from '@/utils/converters';

@Injectable({
  providedIn: 'root',
})
export class BookingApi {
  private apiService = inject(API);

  async readEvents(bookingId: string) {
    const response = await this.apiService.makeRequest(`/booking/${bookingId}`);
    if (response.error) return null;
    const { settings, events } = response.data;
    return { settings, events: parseEventData(events) };
  }

  async readEventsForContact(bookingId: string, name: string, password: string) {
    const response = await this.apiService.makeRequest(`/booking/${bookingId}/contacts`, {
      method: 'POST',
      data: { name, password },
    });
    if (response.error) return null;
    return response.data;
  }

  async bookEvents(bookingId: string, events: eventsType[]) {
    const response = await this.apiService.makeRequest(`/booking/${bookingId}`, {
      method: 'POST',
      data: { events },
    });
    if (response.error) return false;
    return true;
  }
}
