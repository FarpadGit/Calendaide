import { ComponentFixture, TestBed } from '@angular/core/testing';

import { App } from './app';
import { Auth } from '@/services/auth';
import { authSpy } from '@/../test/mockServices';

describe('App', () => {
  let component: App;
  let fixture: ComponentFixture<App>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [{ provide: Auth, useValue: authSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should reauthenticate user if already logged in', async () => {
    authSpy.isDemoUser.mockReturnValueOnce(false);
    await fixture.whenStable();

    expect(authSpy.refreshUser).toHaveBeenCalled();
    expect(authSpy.loginToDemo).not.toHaveBeenCalled();
  });

  it('should reauthenticate demo user if already logged in to demo', async () => {
    authSpy.isDemoUser.mockReturnValueOnce(true);
    await fixture.whenStable();

    expect(authSpy.refreshUser).not.toHaveBeenCalled();
    expect(authSpy.loginToDemo).toHaveBeenCalled();
  });
});
