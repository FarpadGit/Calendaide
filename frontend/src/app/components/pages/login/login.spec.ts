import { ComponentFixture, TestBed } from '@angular/core/testing';
import { page, userEvent } from 'vitest/browser';

import { Login } from './login';
import { MockedObject } from 'vitest';
import { Auth } from '@/services/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { authSpy } from '@/../test/mockServices';

describe('Login', () => {
  let routerSpy: Partial<MockedObject<Router>>;
  let component: Login;
  let fixture: ComponentFixture<Login>;

  beforeEach(async () => {
    routerSpy = {
      navigateByUrl: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        { provide: Auth, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display 2 input boxes for email and password, 3 buttons to log in with credentials, Google oauth flow or as Demo user, and a link to Register page', () => {
    const emailInput = fixture.nativeElement.querySelector('input[name="email"]');
    const passwordInput = fixture.nativeElement.querySelector('input[name="password"]');
    const loginButton = fixture.nativeElement.querySelector('button[type="submit"]');
    const googleButton = page.getByRole('button').filter({ hasText: /google/i });
    const demoButton = page.getByRole('button').filter({ hasText: /demo/i });
    const loginLink = fixture.nativeElement.querySelector('a');

    expect(emailInput).toBeVisible();
    expect(passwordInput).toBeVisible();
    expect(loginButton).toBeVisible();
    expect(googleButton).toBeVisible();
    expect(demoButton).toBeVisible();
    expect(loginLink).toBeVisible();
  });

  it.each([false, true])(
    'should send a request to service to login user with credentials (server success: %s)',
    async (success) => {
      authSpy.loginUser.mockResolvedValueOnce(success);
      const emailInput = fixture.nativeElement.querySelector('input[name="email"]');
      const passwordInput = fixture.nativeElement.querySelector('input[name="password"]');
      const loginButton = fixture.nativeElement.querySelector('button[type="submit"]');

      await userEvent.type(emailInput, 'fake.email@mail.com');
      await userEvent.type(passwordInput, 'fakepassword123');
      await userEvent.click(loginButton);

      if (success) expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/');
      else expect(component.hasError()).toBe(true);
    },
  );

  it('should send a request to service to initiate oauth authentication flow', async () => {
    const googleButton = page.getByRole('button').filter({ hasText: /google/i });

    await userEvent.click(googleButton);

    expect(authSpy.loginUserWithGoogle).toHaveBeenCalled();
  });

  it('should send a request to service to login as Demo user', async () => {
    authSpy.loginToDemo.mockResolvedValueOnce(true);
    const demoButton = page.getByRole('button').filter({ hasText: /demo/i });

    await userEvent.click(demoButton);

    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/');
  });
});
