import { inject, Injectable, signal } from '@angular/core';
import { UserApi } from '@/services/API/user.api';
import { mergeDeep } from '@/utils/shared';

const defaultUserSettings: NonNullable<DeepRequired<userType['settings']>> = {
  saveMode: 'auto',
  businessHours: [],
  bookingData: {
    bookingEnabled: false,
    bookingId: '',
    bookingDuration: 60,
  },
};

@Injectable({
  providedIn: 'root',
})
export class User {
  private apiService = inject(UserApi);
  currentUserData = {
    user: signal<DeepRequired<userType> | null>(null),
    setUser: (user: userType) => {
      const settings = mergeDeep(
        structuredClone(defaultUserSettings),
        user.settings,
      ) as typeof defaultUserSettings;
      this.currentUserData.user.set({ ...user, settings });
    },
    contacts: signal<contactType[]>([]),
    events: signal<eventsType[]>([]),
  };

  getUserSettings() {
    return this.currentUserData.user()?.settings ?? defaultUserSettings;
  }

  async saveUserSettings(newSettings: Partial<userModifiableType>) {
    const { displayname, password, settings: _settings } = newSettings;
    const currentUser = this.currentUserData.user();
    if (!currentUser) return;

    const settings = mergeDeep(
      structuredClone(defaultUserSettings),
      currentUser.settings,
      _settings,
    ) as typeof defaultUserSettings;

    this.currentUserData.user.update((prev) => ({
      ...prev!,
      displayname: displayname ?? prev!.displayname,
      settings,
    }));

    return await this.apiService.updateUser({ displayname, password, settings });
  }

  saveAll() {
    const currentUser = this.currentUserData.user();
    if (currentUser == null) return;

    this.apiService.saveAllUserData(
      currentUser,
      this.currentUserData.contacts(),
      this.currentUserData.events(),
    );
  }

  async deleteUser() {
    await this.apiService.deleteUser();
  }
}
