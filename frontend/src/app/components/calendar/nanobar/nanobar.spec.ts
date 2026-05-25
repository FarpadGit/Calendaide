import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Nanobar } from './nanobar';

describe('Nanobar', () => {
  let component: Nanobar;
  let fixture: ComponentFixture<Nanobar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Nanobar],
    }).compileComponents();

    fixture = TestBed.createComponent(Nanobar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
