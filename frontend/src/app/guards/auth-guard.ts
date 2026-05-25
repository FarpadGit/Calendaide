import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '@/services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);
  return isAuthenticated(authService, router, state.url.split('?')[0]);
};

async function isAuthenticated(authService: Auth, router: Router, url: string) {
  const authenticated = authService.authenticate();
  if (url === '/') {
    return authenticated ? true : router.navigate(['/login']);
  }
  if (url === '/login') {
    return authenticated ? router.navigate(['/']) : true;
  }
  return false;
}
