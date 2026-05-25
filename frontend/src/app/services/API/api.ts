import { Injectable, signal } from '@angular/core';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { parseUserData } from '@/utils/converters';
import { encrypt } from '@/utils/encryption';

@Injectable({
  providedIn: 'root',
})
export class API {
  serverResponse = signal<{ message: string; type: 'success' | 'loading' | 'error' } | null>(null);

  constructor() {
    this.callAxios.interceptors.request.use((req) => {
      if (!req.data || req.data.constructor !== Object) return req;

      // replace any {key: undefined} pairs with {key: null} so JSON serialization won't prune them out
      // and because the server uses null values to know what to remove from db
      const data = { ...req.data };
      for (const key of Object.keys(data)) {
        if (data[key] == undefined) data[key] = null;
      }
      req.data = data;
      return req;
    });
  }

  private callAxios = axios.create({
    baseURL: import.meta?.env?.['NG_APP_SERVER_URL'],
    withCredentials: true,
  });

  private errorFn = (error: AxiosError) => {
    let errorMessage = null;
    switch (error.response?.status) {
      case 401:
        errorMessage = 'Művelet megtagadva. Nem vagy hitelesítve a szervernél.';
        break;
      case 404:
        errorMessage = 'Szerver hiba: A keresett érték nem található az adatbázisban.';
        break;
      default:
        errorMessage = 'Szerver hiba: Ismeretlen probléma lépett fel.';
        break;
    }
    return { error: errorMessage, data: null };
  };

  async makeRequest(url: string, options?: AxiosRequestConfig<any>) {
    return this.callAxios(url, options)
      .then((res: AxiosResponse) => ({ data: !!res.data ? res.data : true, error: null }))
      .catch(this.errorFn);
  }

  setBearer(token: string) {
    this.callAxios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
  }

  revokeBearer() {
    this.callAxios.defaults.headers.common['Authorization'] = undefined;
  }

  async login(email: string, password: string) {
    const userDataJSON = await this.makeRequest('/auth/login', {
      method: 'POST',
      data: await encrypt(JSON.stringify({ email, password })),
    });
    if (userDataJSON.error) return null;

    const userData = parseUserData(userDataJSON.data);
    return userData;
  }

  async loginWithGoogle(email: string, displayname: string, token: string) {
    const userDataJSON = await this.makeRequest('/auth/login/google', {
      method: 'POST',
      data: await encrypt(JSON.stringify({ email, displayname, token })),
    });
    if (userDataJSON.error) return null;

    const userData = parseUserData(userDataJSON.data);
    return userData;
  }

  async refresh() {
    const userDataJSON = await this.makeRequest('/auth/refresh', {
      method: 'POST',
    });
    if (userDataJSON.error) return null;

    const userData: Omit<ReturnType<typeof parseUserData>, 'token'> = parseUserData(
      userDataJSON.data,
    );
    return userData;
  }

  async logout() {
    await this.makeRequest('/auth/logout', {
      method: 'POST',
    });
  }
}
