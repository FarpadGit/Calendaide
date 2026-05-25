import { TestBed } from '@angular/core/testing';

import { UserEvents } from './user-events';

describe('UserEvents', () => {
  let service: UserEvents;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserEvents);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
