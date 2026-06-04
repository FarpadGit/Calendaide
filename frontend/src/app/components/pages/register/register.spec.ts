import { ComponentFixture, TestBed } from '@angular/core/testing';
import { page, userEvent } from 'vitest/browser';

import { Register } from './register';
import { Auth } from '@/services/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { authSpy, routerSpy } from '@/../test/mockServices';

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [
        { provide: Auth, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display 2 input boxes for email and password, a Register button, a Login With Google button and a link to Login page', () => {
    const emailInput = fixture.nativeElement.querySelector('input[name="email"]');
    const passwordInput = fixture.nativeElement.querySelector('input[name="password"]');
    const registerButton = fixture.nativeElement.querySelector('button[type="submit"]');
    const googleButton = page.getByRole('button').filter({ hasText: /google/i });
    const loginLink = fixture.nativeElement.querySelector('a');

    expect(emailInput).toBeVisible();
    expect(passwordInput).toBeVisible();
    expect(registerButton).toBeVisible();
    expect(googleButton).toBeVisible();
    expect(loginLink).toBeVisible();
  });

  it.each([false, true])(
    'should send a request to service to register new user with credentials (server success: %s)',
    async (success) => {
      authSpy.registerUser.mockResolvedValueOnce(success);
      const emailInput = fixture.nativeElement.querySelector('input[name="email"]');
      const passwordInput = fixture.nativeElement.querySelector('input[name="password"]');
      const registerButton = fixture.nativeElement.querySelector('button[type="submit"]');

      await userEvent.type(emailInput, 'fake.email@mail.com');
      await userEvent.type(passwordInput, 'fakepassword123');
      await userEvent.click(registerButton);

      if (success) expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/');
      else expect(component.hasError()).toBe(true);
    },
  );

  it('should send a request to service to initiate oauth authentication flow', async () => {
    const googleButton = page.getByRole('button').filter({ hasText: /google/i });

    await userEvent.click(googleButton);

    expect(authSpy.loginUserWithGoogle).toHaveBeenCalled();
  });
});
