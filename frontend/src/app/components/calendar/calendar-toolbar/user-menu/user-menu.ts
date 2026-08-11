import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '@/services/auth';
import { User } from '@/services/user';
import { AvatarModule } from 'primeng/avatar';
import { PopoverModule } from 'primeng/popover';
import { ButtonModule } from 'primeng/button';
import { userSettings } from '@/types.usersettings';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-user-menu',
  imports: [CommonModule, AvatarModule, PopoverModule, ButtonModule, ProgressSpinnerModule],
  templateUrl: './user-menu.html',
  styleUrl: './user-menu.scss',
})
export class UserMenu {
  private authService = inject(Auth);
  private userService = inject(User);
  userSettings = {} as userSettings;
  isLoading = signal(false);

  constructor() {
    effect(() => {
      this.userSettings = this.userService.getUserSettings();
    });
  }

  get currentUser() {
    return this.userService.currentUserData.user();
  }

  get displayname() {
    return this.currentUser?.displayname ?? '';
  }

  get saveMode() {
    return this.currentUser?.settings.saveMode;
  }

  handleManualSave() {
    this.userService.saveAll();
  }

  async handleLogout() {
    this.isLoading.set(true);
    await this.authService.logoutUser();
  }
}
