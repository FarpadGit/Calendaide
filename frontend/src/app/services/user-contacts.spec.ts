import { TestBed } from '@angular/core/testing';

import { UserContacts } from './user-contacts';

describe('UserContacts', () => {
  let service: UserContacts;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserContacts);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
