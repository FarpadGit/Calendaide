import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewEvents } from './new-events';

describe('NewEvents', () => {
  let component: NewEvents;
  let fixture: ComponentFixture<NewEvents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewEvents],
    }).compileComponents();

    fixture = TestBed.createComponent(NewEvents);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
