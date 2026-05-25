import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '@/services/auth';
import { User } from '@/services/user';
import { AvatarModule } from 'primeng/avatar';
import { PopoverModule } from 'primeng/popover';
import { ButtonModule } from 'primeng/button';
import { userSettings } from '@/types.usersettings';

@Component({
  selector: 'app-user-menu',
  imports: [CommonModule, AvatarModule, PopoverModule, ButtonModule],
  templateUrl: './user-menu.html',
  styleUrl: './user-menu.scss',
})
export class UserMenu {
  private authService = inject(Auth);
  private userService = inject(User);
  userSettings = {} as userSettings;

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

  handleLogout() {
    this.authService.logoutUser();
  }
}
