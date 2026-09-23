import { Routes } from '@angular/router';
import { authGuard } from '@/guards/auth-guard';
import { Login } from '@/components/pages/login/login';
import { Calendar } from '@/components/calendar/calendar';
import { Register } from '@/components/pages/register/register';
import { Redirect } from '@/components/pages/redirect/redirect';
import { Booking } from './components/pages/booking/booking';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Calendaide | Bejelentkezés',
    component: Login,
    canActivate: [authGuard],
  },
  {
    path: 'register',
    title: 'Calendaide | Regisztráció',
    component: Register,
  },
  {
    path: ':bookingId/foglalas',
    title: 'Calendaide | Időpontfoglalás',
    component: Booking,
  },
  {
    path: '',
    title: 'Calendaide',
    component: Calendar,
    canActivate: [authGuard],
  },
  {
    path: 'redirect',
    title: 'Átirányítás...',
    component: Redirect,
  },
  {
    path: '**',
    title: 'Oldal Nem Található',
    redirectTo: '',
  },
];
