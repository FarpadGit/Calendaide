import { Component, effect, inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '@/services/auth';
import { User } from '@/services/user';
import { LabelWithHint } from '@/components/calendar/calendar-toolbar/user-settings/label-with-hint';
import { WeekPicker } from '@/components/dialogs/event-dialog/week-picker/week-picker';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';
import { InplaceModule } from 'primeng/inplace';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { DatePickerModule } from 'primeng/datepicker';
import { ConfirmationService } from 'primeng/api';
import { userSettingValues } from '@/types.usersettings';
import { dateToText } from '@/utils/datetime';

@Component({
  selector: 'app-user-settings',
  imports: [
    ReactiveFormsModule,
    NgTemplateOutlet,
    InputTextModule,
    ButtonModule,
    SelectButtonModule,
    InplaceModule,
    TooltipModule,
    ConfirmPopupModule,
    DatePickerModule,
    ToggleSwitchModule,
    LabelWithHint,
    WeekPicker,
  ],
  providers: [ConfirmationService],
  templateUrl: './user-settings.html',
  styleUrl: './user-settings.scss',
})
export class UserSettings {
  private authService = inject(Auth);
  private userService = inject(User);
  private confirmationService = inject(ConfirmationService);

  settingsForm = new FormGroup({
    displayName: new FormControl(''),
    password: new FormControl<string | null>(null, Validators.minLength(6)),
    userSettings: new FormGroup({
      saveMode: new FormControl('auto', Validators.required),
      businessHours: new FormArray<
        FormGroup<{
          daysOfWeek: FormControl<number[] | null>;
          startTime: FormControl<Date | null>;
          endTime: FormControl<Date | null>;
        }>
      >([]),
      bookingData: new FormGroup({
        bookingEnabled: new FormControl(false, Validators.required),
        bookingId: new FormControl('', [
          Validators.pattern('[a-z][a-z0-9-]*'),
          Validators.minLength(5),
        ]),
        bookingDuration: new FormControl(60, [Validators.required, Validators.min(30)]),
      }),
    }),
  });

  get userSettings() {
    return this.settingsForm.controls.userSettings.controls;
  }
  get businessHours() {
    return this.settingsForm.controls.userSettings.controls.businessHours.controls;
  }
  get bookingData() {
    return this.settingsForm.controls.userSettings.controls.bookingData.controls;
  }
  get origin() {
    return window.location.origin;
  }

  constructor() {
    effect(() => {
      const settings = this.userService.getUserSettings();
      const displayname = this.userService.currentUserData.user()?.displayname ?? '';
      this.settingsForm.controls.displayName.setValue(displayname);
      this.userSettings.saveMode.setValue(settings.saveMode);
      this.userSettings.businessHours.clear();
      settings.businessHours.forEach((bh) => {
        const days = bh.daysOfWeek.map((day) => day - 1);
        const start = new Date('1970-' + bh.startTime);
        const end = new Date('1970-' + bh.endTime);
        this.userSettings.businessHours.push(
          new FormGroup({
            daysOfWeek: new FormControl(days, Validators.required),
            startTime: new FormControl(start, Validators.required),
            endTime: new FormControl(end, Validators.required),
          }),
        );
      });
      this.userSettings.bookingData.setValue(settings.bookingData);

      if (this.isDemoUser) this.settingsForm.disable();
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

  addNewBusinessHours() {
    if (this.isDemoUser) return;
    const start = new Date(0);
    const end = new Date(0);
    start.setHours(9);
    start.setMinutes(0);
    end.setHours(17);
    end.setMinutes(0);
    const form = new FormGroup({
      daysOfWeek: new FormControl<number[]>([], Validators.required),
      startTime: new FormControl(start, Validators.required),
      endTime: new FormControl(end, Validators.required),
    }) as (typeof this.businessHours)[number];
    this.userSettings.businessHours.push(form);
  }

  removeBusinessHour(index: number) {
    this.userSettings.businessHours.removeAt(index);
  }

  async handleSettingsChange() {
    if (this.isDemoUser) return;
    if (!this.bookingData.bookingEnabled.value) {
      const oldUserSettings = this.userService.getUserSettings();
      this.bookingData.bookingDuration.reset(oldUserSettings?.bookingData.bookingDuration);
      this.bookingData.bookingId.reset(oldUserSettings?.bookingData.bookingId);
    }

    if (this.settingsForm.invalid) {
      this.settingsForm.markAllAsTouched();
      return;
    }

    let displayname = this.settingsForm.controls.displayName.value ?? undefined;
    if (displayname === '') displayname = undefined;
    let password = this.settingsForm.controls.password.value ?? undefined;
    if (password === '') password = undefined;
    const settingsFormData = this.settingsForm.controls.userSettings.value;
    const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };

    const settings = {
      saveMode: settingsFormData.saveMode ?? 'auto',
      businessHours: settingsFormData.businessHours?.map((e) => ({
        daysOfWeek: e.daysOfWeek?.map((day) => day + 1) ?? [],
        startTime: dateToText(e.startTime ?? new Date(0), options),
        endTime: dateToText(e.endTime ?? new Date(0), options),
      })),
      bookingData: {
        bookingEnabled: settingsFormData.bookingData?.bookingEnabled ?? false,
        bookingId: settingsFormData.bookingData?.bookingId ?? '',
        bookingDuration: settingsFormData.bookingData?.bookingDuration ?? 60,
      },
    } as Required<userType['settings']>;

    const result = await this.userService.saveUserSettings({ displayname, password, settings });
    if (result?.status === 409)
      this.settingsForm.controls.userSettings.controls.bookingData.controls.bookingId.setErrors({
        conflict: true,
      });
  }

  handleAccountDelete(e: Event) {
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
