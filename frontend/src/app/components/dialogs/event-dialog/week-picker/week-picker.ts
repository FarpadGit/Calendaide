import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PopoverModule } from 'primeng/popover';
import { weekdays } from '@/utils/datetime';

@Component({
  selector: 'app-week-picker',
  imports: [CommonModule, FormsModule, InputTextModule, PopoverModule],
  templateUrl: './week-picker.html',
  styleUrl: './week-picker.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: WeekPicker,
      multi: true,
    },
  ],
})
export class WeekPicker {
  currentValues: number[] | null = [];
  inputText: string = '';
  onInputChanged: Function | null = null;

  get weekdays() {
    return weekdays;
  }

  handleInputChange(value: string) {
    const days = value.split(',').map((d) => d.trim());
    this.currentValues = [];

    days.forEach((d) => {
      const weekday = weekdays.find((wd) => wd.name === d);
      if (!weekday) {
        this.currentValues = [];
        return;
      }
      this.currentValues = [...this.currentValues!, weekday.value];
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
    else
      this.inputText = this.currentValues
        ?.map((v) => weekdays.find((wd) => wd.value === v)!.name)
        .join(',');
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
