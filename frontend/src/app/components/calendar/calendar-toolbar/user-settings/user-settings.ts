import { Component, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Auth } from '@/services/auth';
import { User } from '@/services/user';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';
import { InplaceModule } from 'primeng/inplace';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ConfirmationService } from 'primeng/api';
import { userSettings, userSettingValues } from '@/types.usersettings';

@Component({
  selector: 'app-user-settings',
  imports: [
    FormsModule,
    InputTextModule,
    ButtonModule,
    SelectButtonModule,
    InplaceModule,
    TooltipModule,
    ConfirmPopupModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './user-settings.html',
  styleUrl: './user-settings.scss',
})
export class UserSettings {
  private authService = inject(Auth);
  private userService = inject(User);
  private confirmationService = inject(ConfirmationService);
  userSettings = {} as userSettings;
  displayname: string = '';
  password?: string;

  constructor() {
    effect(() => {
      this.userSettings = this.userService.getUserSettings();
      this.displayname = this.userService.currentUserData.user()?.displayname ?? '';
    });
  }

  get isDemoUser() {
    return this.authService.isDemoUser();
  }

  get saveMode() {
    return this.userService.currentUserData.user()?.settings.saveMode;
  }

  get saveModes() {
    return userSettingValues.saveMode.map((v, i) => ({
      label: userSettingValues.saveModeLabel[i],
      value: v,
    }));
  }

  handleSettingsChange() {
    const displayname = this.displayname;
    const password = this.password === '' ? undefined : this.password;
    this.userService.saveUserSettings({ displayname, password, settings: this.userSettings });
  }

  handleDelete(e: Event) {
    this.confirmationService.confirm({
      target: e.currentTarget as EventTarget,
      message: `Biztos véglegesen törölni szeretnéd a fiókodat és vele együtt az összes 
                adatbázisban szereplő adatodat? Ez a folyamat nem visszafordítható.`,
      icon: 'pi pi-info-circle',
      rejectButtonProps: {
        label: 'Mégse',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Törlés',
        severity: 'danger',
      },
      accept: async () => {
        await this.userService.deleteUser();
        await this.authService.logoutUser();
      },
    });
  }
}
