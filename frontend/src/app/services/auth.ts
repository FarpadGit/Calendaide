import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { API } from '@/services/API/api';
import { UserApi } from '@/services/API/user.api';
import { User } from '@/services/user';
import { demoUserData } from '@/utils/demo';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private apiService = inject(API);
  private oAuthService = inject(OAuthService);
  private userApiService = inject(UserApi);
  private userService = inject(User);
  private router = inject(Router);
  private sessionStorageKey = '_session';
  private demoUserToken = 'DemoUser';

  constructor() {
    const googleAuthConfig: AuthConfig = {
      issuer: 'https://accounts.google.com',
      strictDiscoveryDocumentValidation: false,
      responseType: 'code',
      dummyClientSecret: import.meta.env['NG_APP_GOOGLE_SECRET'],
      clientId: import.meta.env['NG_APP_GOOGLE_CLIENTID'],
      redirectUri: window.location.origin + '/redirect',
      scope: 'openid profile email',
    };
    this.oAuthService.configure(googleAuthConfig);
    this.oAuthService.setupAutomaticSilentRefresh();
    this.oAuthService.loadDiscoveryDocumentAndTryLogin();
    this.oAuthService.events.subscribe(async (event) => {
      if (event.type === 'token_received') {
        const { email, name, sub } = this.oAuthService.getIdentityClaims();
        const response = await this.apiService.loginWithGoogle(email, name, sub);
        const success = this.handleLoginResults(response);

        if (success) await this.router.navigateByUrl('/');
        else await this.logoutUser();
      }
    });
  }

  authenticate() {
    const session = sessionStorage.getItem(this.sessionStorageKey);
    if (session != null) return true;
    const oauthSession = this.oAuthService.hasValidAccessToken();
    if (oauthSession) return true;
    return false;
  }

  isDemoUser() {
    const session = sessionStorage.getItem(this.sessionStorageKey);
    return session === this.demoUserToken;
  }

  canAutosaveToServer() {
    return !this.isDemoUser() && 'auto' === this.userService.getUserSettings()?.saveMode;
  }

  async registerUser(email: string, password: string) {
    const response = await this.userApiService.createUser(email, password);
    if (response.data) return await this.loginUser(email, password);
    return false;
  }

  async loginUser(email: string, password: string) {
    const response = await this.apiService.login(email, password);
    return this.handleLoginResults(response);
  }

  loginUserWithGoogle() {
    this.oAuthService.initCodeFlow();
  }

  private handleLoginResults(userData: Awaited<ReturnType<API['login']>>) {
    if (userData == null || !userData.token) return false;

    this.userService.currentUserData.setUser(userData.user);
    this.userService.currentUserData.contacts.set(userData.contacts);
    this.userService.currentUserData.events.set(userData.events);

    this.apiService.setBearer(userData.token as string);
    sessionStorage.setItem(this.sessionStorageKey, userData.token);

    return true;
  }

  async refreshUser() {
    const session = sessionStorage.getItem(this.sessionStorageKey);
    if (!session || session === this.demoUserToken) return;

    this.apiService.setBearer(session);
    const response = await this.apiService.refresh();
    if (response == null) {
      await this.logoutUser();
      return;
    }

    this.userService.currentUserData.setUser(response.user);
    this.userService.currentUserData.contacts.set(response.contacts);
    this.userService.currentUserData.events.set(response.events);
  }

  loginToDemo() {
    this.userService.currentUserData.setUser(demoUserData.user);
    this.userService.currentUserData.contacts.set(demoUserData.contacts);
    this.userService.currentUserData.events.set(demoUserData.events);
    sessionStorage.setItem(this.sessionStorageKey, this.demoUserToken);

    return true;
  }

  async logoutUser() {
    if (this.oAuthService.hasValidAccessToken()) await this.oAuthService.revokeTokenAndLogout();
    if (!this.isDemoUser()) await this.apiService.logout();
    this.apiService.revokeBearer();
    sessionStorage.removeItem(this.sessionStorageKey);
    this.userService.currentUserData.user.set(null);
    this.userService.currentUserData.contacts.set([]);
    this.userService.currentUserData.events.set([]);
    await this.router.navigateByUrl('/login');
  }
}
