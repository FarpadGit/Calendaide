import { inject, Injectable } from '@angular/core';
import { API } from '@/services/API/api';

@Injectable({
  providedIn: 'root',
})
export class ContactApi {
  private apiService = inject(API);

  async createContact(contact: contactType) {
    this.apiService.serverResponse.set({ message: '', type: 'loading' });
    const response = await this.apiService.makeRequest('/contacts', {
      method: 'POST',
      data: contact,
    });
    if (response.data)
      this.apiService.serverResponse.set({ message: 'Új kapcsolat hozzáadva', type: 'success' });
    if (response.error)
      this.apiService.serverResponse.set({ message: response.error, type: 'error' });
    return response;
  }

  async updateContact(contactId: contactType['id'], contact: Partial<Omit<contactType, 'id'>>) {
    this.apiService.serverResponse.set({ message: '', type: 'loading' });
    const response = await this.apiService.makeRequest(`/contacts/${contactId}`, {
      method: 'PUT',
      data: contact,
    });
    if (response.data)
      this.apiService.serverResponse.set({
        message: 'Kapcsolat módosítások elmentve',
        type: 'success',
      });
    if (response.error)
      this.apiService.serverResponse.set({ message: response.error, type: 'error' });
    return response;
  }

  async deleteContact(contactId: contactType['id']) {
    this.apiService.serverResponse.set({ message: '', type: 'loading' });
    const response = await this.apiService.makeRequest(`/contacts/${contactId}`, {
      method: 'DELETE',
    });
    if (response.data)
      this.apiService.serverResponse.set({ message: 'Kapcsolat törölve', type: 'success' });
    if (response.error)
      this.apiService.serverResponse.set({ message: response.error, type: 'error' });
    return response;
  }
}
