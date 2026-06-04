import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router } from '@angular/router';

import { authGuard } from './auth-guard';
import { authSpy, routerSpy } from '@/../test/mockServices';
import { Auth } from '@/services/auth';

describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Auth, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should redirect to login page if user is not authenticated', () => {
    authSpy.authenticate.mockReturnValueOnce(false);

    const result = executeGuard(null as any, { url: '/', root: null as any });

    expect(result).toBeTruthy();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should allow if user is authenticated', () => {
    authSpy.authenticate.mockReturnValueOnce(true);

    const result = executeGuard(null as any, { url: '/', root: null as any });

    expect(result).toBeTruthy();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should redirect from login page if user is already authenticated', () => {
    authSpy.authenticate.mockReturnValueOnce(true);

    const result = executeGuard(null as any, { url: '/login', root: null as any });

    expect(result).toBeTruthy();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });
});
