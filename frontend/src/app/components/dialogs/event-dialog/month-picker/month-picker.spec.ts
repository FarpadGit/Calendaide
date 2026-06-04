import { ComponentFixture, TestBed } from '@angular/core/testing';
import { userEvent } from 'vitest/browser';

import { MonthPicker } from './month-picker';

describe('MonthPicker', () => {
  let component: MonthPicker;
  let fixture: ComponentFixture<MonthPicker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthPicker],
    }).compileComponents();

    fixture = TestBed.createComponent(MonthPicker);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept a comma separated input text if all items are valid numbers between 1 and 31', async () => {
    const inputElement: HTMLInputElement = fixture.nativeElement.querySelector('input');

    await userEvent.type(inputElement, '2, 10, 17{Enter}');

    expect(component.inputText).toBe('2,10,17');
    expect(component.currentValues).toEqual([2, 10, 17]);
  });

  it.each([
    ['non-number', 'incorrect input'],
    ['days > 31', '10, 40'],
    ['days < 1', '0, -4'],
  ])(
    'should not accept input text if it is not a valid comma separated list (%s)',
    async (_, type) => {
      const inputElement: HTMLInputElement = fixture.nativeElement.querySelector('input');

      await userEvent.type(inputElement, type + '{Enter}');

      expect(component.inputText).toBe('');
      expect(component.currentValues).toEqual([]);
    },
  );

  it('should add the selected monthday to input element text', async () => {
    const inputElement: HTMLInputElement = fixture.nativeElement.querySelector('input');
    await userEvent.type(inputElement, '5, 12{Enter}');

    component.handleDateSelect(6);

    expect(component.inputText).toBe('5,12,6');
    expect(component.currentValues).toEqual([5, 12, 6]);
  });

  it('should remove the selected monthday from input element text if already present', async () => {
    const inputElement: HTMLInputElement = fixture.nativeElement.querySelector('input');
    await userEvent.type(inputElement, '5, 12{Enter}');

    component.handleDateSelect(5);

    expect(component.inputText).toBe('12');
    expect(component.currentValues).toEqual([12]);
  });
});
