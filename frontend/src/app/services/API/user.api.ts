import { inject, Injectable } from '@angular/core';
import { API } from '@/services/API/api';
import { encrypt } from '@/utils/encryption';

@Injectable({
  providedIn: 'root',
})
export class UserApi {
  private apiService = inject(API);

  async createUser(email: string, password: string) {
    const response = await this.apiService.makeRequest('/auth/register', {
      method: 'POST',
      data: await encrypt(JSON.stringify({ email, password })),
    });
    return response;
  }

  async updateUser(user: Partial<userModifiableType>) {
    this.apiService.serverResponse.set({ message: '', type: 'loading' });
    const response = await this.apiService.makeRequest(`/users`, {
      method: 'PUT',
      data: await encrypt(JSON.stringify(user)),
    });
    if (response.data)
      this.apiService.serverResponse.set({
        message: 'Felhasználói adatok elmentve',
        type: 'success',
      });
    if (response.error)
      this.apiService.serverResponse.set({ message: response.error, type: 'error' });
    return response;
  }

  async deleteUser() {
    const response = await this.apiService.makeRequest(`/users`, {
      method: 'DELETE',
    });
    return response;
  }

  async saveAllUserData(user: userType, contacts: contactType[], events: eventsType[]) {
    this.apiService.serverResponse.set({ message: '', type: 'loading' });
    const response = await this.apiService.makeRequest(`/users/userdata`, {
      method: 'POST',
      data: { user, contacts, events },
    });
    if (response.data)
      this.apiService.serverResponse.set({
        message: 'Naptár adatok sikeresen elmentve',
        type: 'success',
      });
    if (response.error)
      this.apiService.serverResponse.set({ message: response.error, type: 'error' });
    return response;
  }
}
