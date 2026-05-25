import { ComponentFixture, TestBed } from '@angular/core/testing';

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
});
