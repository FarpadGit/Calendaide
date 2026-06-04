import { ComponentFixture, TestBed } from '@angular/core/testing';
import { userEvent } from 'vitest/browser';

import { WeekPicker } from './week-picker';

describe('WeekPicker', () => {
  let component: WeekPicker;
  let fixture: ComponentFixture<WeekPicker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeekPicker],
    }).compileComponents();

    fixture = TestBed.createComponent(WeekPicker);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept a comma separated input text if all items are valid day names', async () => {
    const inputElement: HTMLInputElement = fixture.nativeElement.querySelector('input');

    await userEvent.type(inputElement, 'Hétfő, Kedd{Enter}');

    expect(component.inputText).toBe('Hétfő,Kedd');
    expect(component.currentValues).toEqual([0, 1]);
  });

  it('should not accept input text if it is not a valid comma separated list of day names', async () => {
    const inputElement: HTMLInputElement = fixture.nativeElement.querySelector('input');

    await userEvent.type(inputElement, 'incorrect input{Enter}');

    expect(component.inputText).toBe('');
    expect(component.currentValues).toEqual([]);
  });

  it('should add the selected weekday to input element text', async () => {
    const inputElement: HTMLInputElement = fixture.nativeElement.querySelector('input');
    await userEvent.type(inputElement, 'Hétfő, Kedd{Enter}');

    component.handleDateSelect(6);

    expect(component.inputText).toBe('Hétfő,Kedd,Vasárnap');
    expect(component.currentValues).toEqual([0, 1, 6]);
  });

  it('should remove the selected weekday from input element text if already present', async () => {
    const inputElement: HTMLInputElement = fixture.nativeElement.querySelector('input');
    await userEvent.type(inputElement, 'Hétfő, Kedd{Enter}');

    component.handleDateSelect(0);

    expect(component.inputText).toBe('Kedd');
    expect(component.currentValues).toEqual([1]);
  });
});
