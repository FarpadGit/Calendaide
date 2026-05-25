import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PopoverModule } from 'primeng/popover';
import { dateToText } from '@/utils/datetime';
import { mod } from '@/utils/shared';

@Component({
  selector: 'app-month-picker',
  imports: [CommonModule, FormsModule, InputTextModule, PopoverModule],
  templateUrl: './month-picker.html',
  styleUrl: './month-picker.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: MonthPicker,
      multi: true,
    },
  ],
})
export class MonthPicker implements OnChanges {
  @Input() month: Date | null = null;

  daysOfTheMonth: number[][] = [[]];
  headerText = '';

  currentValues: number[] | null = [];
  inputText: string = '';
  onInputChanged: Function | null = null;

  ngOnChanges(): void {
    if (this.month == null) this.month = new Date();

    const days = this.totalDaysInMonth(this.month);
    const startIndex = this.firstDayOfMonth(this.month);
    const endPadding = mod(7 - ((days + startIndex) % 7), 7);

    let rest: number[] = [];
    if (endPadding > 0) rest = new Array(endPadding).fill(null).map((_, i) => -(days + i + 1));

    const daysArray = [
      ...new Array(startIndex).fill(null).map((_, i) => -i),
      ...new Array(days).fill(null).map((_, i) => i + 1),
      ...rest,
    ];

    const weeks: number[][] = [];
    for (let i = 0; i < daysArray.length; i += 7) {
      const week = daysArray.slice(i, i + 7);
      weeks.push(week);
    }

    this.daysOfTheMonth = weeks;
    this.headerText = dateToText(this.month, { month: 'long' }).replace(/^./, (c) =>
      c.toUpperCase(),
    );
  }

  handleInputChange(value: string) {
    const days = value.split(',').map((d) => d.trim());
    this.currentValues = [];

    days.forEach((d) => {
      const asNumber = Number.parseInt(d);
      if (isNaN(asNumber) || asNumber < 0 || asNumber > 31) {
        this.currentValues = [];
        return;
      }
      this.currentValues = [...this.currentValues!, asNumber];
    });

    this.setInputText();

    //callback for reactive forms
    this.onInputChanged?.(this.currentValues);
  }

  handleDateSelect(value: number) {
    if (this.currentValues == null) this.currentValues = [];
    if (this.currentValues.includes(value))
      this.currentValues = this.currentValues.filter((v) => v !== value);
    else this.currentValues = [...this.currentValues, value];

    this.setInputText();

    //callback for reactive forms
    this.onInputChanged?.(this.currentValues);
  }

  setInputText() {
    if (!this.currentValues) this.inputText = '';
    else this.inputText = this.currentValues.join(',');
  }

  private totalDaysInMonth(date: Date) {
    const _date = new Date(date);
    _date.setMonth(_date.getMonth() + 1);
    _date.setDate(0);
    return _date.getDate();
  }

  private firstDayOfMonth(date: Date) {
    const _date = new Date(date);
    _date.setDate(1);
    return mod(_date.getDay() - 1, 7);
  }

  // functions for bridging component with reactive forms
  writeValue(values: number[]): void {
    this.currentValues = values;
    this.setInputText();
  }
  registerOnChange(fn: Function): void {
    this.onInputChanged = fn;
  }
  registerOnTouched(fn: Function): void {}
}
