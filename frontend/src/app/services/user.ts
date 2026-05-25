import { inject, Injectable, signal } from '@angular/core';
import { userSettings } from '@/types.usersettings';
import { UserApi } from '@/services/API/user.api';

const defaultUserSettings: userSettings = {
  saveMode: 'auto',
};

@Injectable({
  providedIn: 'root',
})
export class User {
  private apiService = inject(UserApi);
  currentUserData = {
    user: signal<DeepRequired<userType> | null>(null),
    setUser: (user: userType) => {
      const settings = { ...defaultUserSettings, ...user.settings };
      this.currentUserData.user.set({ ...user, settings });
    },
    contacts: signal<contactType[]>([]),
    events: signal<eventsType[]>([]),
  };

  getUserSettings() {
    return this.currentUserData.user()?.settings ?? defaultUserSettings;
  }

  saveUserSettings(newSettings: Partial<userModifiableType>) {
    const { displayname, password, settings: _settings } = newSettings;
    const currentUser = this.currentUserData.user();
    if (!currentUser) return;
    const settings = { ...defaultUserSettings, ...currentUser.settings, ..._settings };
    this.currentUserData.user.update((prev) => ({
      ...prev!,
      displayname: displayname ?? prev!.displayname,
      settings,
    }));
    this.apiService.updateUser({ displayname, password, settings });
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
