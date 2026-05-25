import { inject, Injectable } from '@angular/core';
import { API } from '@/services/API/api';
import { eventTypeToJSON } from '@/utils/converters';

@Injectable({
  providedIn: 'root',
})
export class EventApi {
  private apiService = inject(API);

  async createEvents(events: eventsType[]) {
    this.apiService.serverResponse.set({ message: '', type: 'loading' });
    const response = await this.apiService.makeRequest('/events', {
      method: 'POST',
      data: { events: events.map((e) => eventTypeToJSON(e)) },
    });
    if (response.data) {
      const message = events.length === 1 ? 'Új esemény létrehozva' : 'Új események létrehozva';
      this.apiService.serverResponse.set({ message, type: 'success' });
    }
    if (response.error)
      this.apiService.serverResponse.set({ message: response.error, type: 'error' });
    return response;
  }

  async updateEvents(events: Partial<eventsType>[]) {
    this.apiService.serverResponse.set({ message: '', type: 'loading' });
    const response = await this.apiService.makeRequest('/events', {
      method: 'PUT',
      data: { events: events.map((e) => eventTypeToJSON(e)) },
    });
    if (response.data)
      this.apiService.serverResponse.set({
        message: 'Esemény módosítások elmentve',
        type: 'success',
      });
    if (response.error)
      this.apiService.serverResponse.set({ message: response.error, type: 'error' });
    return response;
  }

  async deleteEvents(eventIds: eventsType['id'][]) {
    this.apiService.serverResponse.set({ message: '', type: 'loading' });
    const response = await this.apiService.makeRequest('/events', {
      method: 'DELETE',
      data: { events: eventIds.map((id) => ({ id })) },
    });
    if (response.data) {
      const message = eventIds.length === 1 ? 'Esemény törölve' : 'Események törölve';
      this.apiService.serverResponse.set({ message, type: 'success' });
    }
    if (response.error)
      this.apiService.serverResponse.set({ message: response.error, type: 'error' });
    return response;
  }
}
