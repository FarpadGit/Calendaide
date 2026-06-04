import { Component, effect, EventEmitter, inject, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { WeekPicker } from '@/components/dialogs/event-dialog/week-picker/week-picker';
import { MonthPicker } from '@/components/dialogs/event-dialog/month-picker/month-picker';
import { UserEvents } from '@/services/user-events';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { InplaceModule } from 'primeng/inplace';
import { TooltipModule } from 'primeng/tooltip';
import { getDuration } from '@/utils/datetime';

type recurrenceType = NonNullable<eventsType['recurrenceData']>['rrule'];

@Component({
  selector: 'app-event-dialog',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    TextareaModule,
    RadioButtonModule,
    SelectModule,
    DatePickerModule,
    ToggleSwitchModule,
    InplaceModule,
    TooltipModule,
    WeekPicker,
    MonthPicker,
  ],
  templateUrl: './event-dialog.html',
  styleUrl: './event-dialog.scss',
})
export class EventDialog {
  @Output() onSave: EventEmitter<string | undefined> = new EventEmitter();
  private eventsService = inject(UserEvents);
  private eventData: eventsType | undefined;

  dialogForm = new FormGroup({
    type: new FormControl<eventsType['type']>('single', Validators.required),
    title: new FormControl('', Validators.required),
    isAllday: new FormControl(true, Validators.required),
    startTime: new FormControl<Date | null>(null),
    duration: new FormControl<number>(30, Validators.min(30)),
    comment: new FormControl(''),
    recurrenceData: new FormGroup<{
      groupId: FormControl<string | null>;
      interval: FormControl<number | null>;
      frequency: FormControl<recurrenceType['freq'] | null>;
      byWeekDay: FormControl<number[] | null>;
      byMonthDay: FormControl<number[] | null>;
      until: FormControl<Date | null>;
    }>({
      groupId: new FormControl(null, Validators.pattern('[a-zA-Z-_]*')),
      interval: new FormControl(1, Validators.min(1)),
      frequency: new FormControl('weekly'),
      byWeekDay: new FormControl(null),
      byMonthDay: new FormControl(null),
      until: new FormControl(null),
    }),
  });

  typeOptions: { name: string; value: eventsType['type'] }[] = [
    { name: 'egyszeri', value: 'single' },
    { name: 'rendszeres', value: 'recurring' },
  ];
  frequencyOptions: { name: string; value: recurrenceType['freq'] }[] = [
    { name: 'naponta', value: 'daily' },
    { name: 'hetente', value: 'weekly' },
    { name: 'havonta', value: 'monthly' },
  ];

  constructor() {
    effect(() => {
      const eventID = this.eventsService.eventWithEditMenuOpen();
      if (!eventID) return;
      const event = this.eventsService.getEventByID(eventID);
      if (!event || this.eventData) return;
      // effect will run again bc form value setters also trigger it. Checking if eventData is defined is important to escape it.

      this.eventData = { ...event };
      let duration = getDuration(event.start, event.end);
      if (duration < 30 && !event.allDay) duration = 30;
      const controls = this.dialogForm.controls;
      controls.type.setValue(event.type);
      controls.title.setValue(event.title);
      controls.isAllday.setValue(event.allDay ?? false);
      controls.startTime.setValue(event.start ?? null);
      controls.duration.setValue(duration);
      controls.comment.setValue(event.comment ?? null);

      const recurrenceData = controls.recurrenceData.controls;
      const eventRRule = event.recurrenceData?.rrule;

      if (eventRRule) {
        recurrenceData.groupId.setValue(event.recurrenceData?.groupId ?? null);
        recurrenceData.interval.setValue(eventRRule.interval ?? null);
        recurrenceData.frequency.setValue(eventRRule.freq ?? null);
        recurrenceData.byWeekDay.setValue(eventRRule.byweekday ?? null);
        recurrenceData.byMonthDay.setValue(eventRRule.bymonthday ?? null);
        const until = eventRRule.until ? new Date(eventRRule.until) : null;
        recurrenceData.until.setValue(until);
      }
    });
  }

  get isVisible() {
    return this.eventsService.eventWithEditMenuOpen() != null;
  }

  set isVisible(value: boolean) {
    if (value && this.eventData) this.eventsService.eventWithEditMenuOpen.set(this.eventData.id);
    else {
      this.eventsService.eventWithEditMenuOpen.set(null);
      this.eventData = undefined;
      this.dialogForm.reset({
        recurrenceData: {
          frequency: 'weekly',
          interval: 1,
        },
      });
    }
  }

  get isAllDay() {
    return this.dialogForm.controls.isAllday.value;
  }
  get isRecurring() {
    return this.dialogForm.controls.type.value === 'recurring';
  }
  get frequency() {
    return this.dialogForm.controls.recurrenceData.controls.frequency.value;
  }
  get byTimeControl() {
    const recurrenceData = this.dialogForm.controls.recurrenceData.controls;
    if (this.frequency === 'weekly') return recurrenceData.byWeekDay;
    if (this.frequency === 'monthly') return recurrenceData.byMonthDay;
    return recurrenceData.byWeekDay;
  }

  handleFrequencyChange() {
    const recurrenceData = this.dialogForm.controls.recurrenceData.controls;
    recurrenceData.byWeekDay.reset();
    recurrenceData.byMonthDay.reset();
  }

  handleSave() {
    if (!this.eventData) return;
    if (this.dialogForm.invalid) return;

    // shutting up typescript so that form values are not in fact empty
    type formValuesType<T> = Required<{ [P in keyof T]: NonNullable<T[P]> }>;

    const values = this.dialogForm.value as formValuesType<typeof this.dialogForm.value>;

    this.eventData.type = values.type;
    this.eventData.title = values.title;
    this.eventData.allDay = values.isAllday;
    this.eventData.start = values.startTime;
    if (this.eventData.start)
      this.eventData.end = new Date(values.startTime.getTime() + values.duration * 60 * 1000);
    else this.eventData.end = undefined;
    this.eventData.comment = values.comment;

    if (values.type === 'recurring' && this.eventData.start) {
      const recurrenceData = { ...values.recurrenceData };
      if (recurrenceData.groupId === '') recurrenceData.groupId = null;
      this.eventData.recurrenceData = {
        groupId: recurrenceData.groupId ?? null,
        rrule: {
          freq: recurrenceData.frequency!,
          interval: recurrenceData.interval ?? 1,
          dtstart: this.eventData.start.toISOString(),
          until: recurrenceData.until?.toISOString(),
          byweekday:
            recurrenceData.frequency === 'weekly'
              ? (recurrenceData.byWeekDay ?? undefined)
              : undefined,
          bymonthday:
            recurrenceData.frequency === 'monthly'
              ? (recurrenceData.byMonthDay ?? undefined)
              : undefined,
        },
      };
    } else {
      this.eventData.type = 'single';
      this.eventData.recurrenceData = undefined;
    }

    this.eventsService.editEvent(this.eventData.id, this.eventData);
    if (this.eventData.type === 'recurring') this.onSave.emit();
    else this.onSave.emit(this.eventData.id);

    this.isVisible = false;
  }
}
