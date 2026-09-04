import { HttpClient } from '@angular/common/http';
import { computed, inject, Service, Signal } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { concatMap, finalize, map, Observable } from 'rxjs';
import {
  AuthToken,
  LoginResponse,
  LoginResponseCode,
  PlatformUrlProvider,
  User,
} from '@ep-crm/core';
import {
  EntitySchemaManager,
  PlatformHost,
  RightsService,
  UserContextService,
} from '@ep-crm/devkit';

function loginFailureMessage(response: LoginResponse): string {
  return response.Exception?.Message || 'Authentication failed.';
}

@Service()
export class AuthorizationService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly userContext = inject(UserContextService);
  private readonly rights = inject(RightsService);
  private readonly schemas = inject(EntitySchemaManager);
  private readonly host = inject(PlatformHost);
  private readonly urlProvider = inject(PlatformUrlProvider);

  readonly isAuthenticated: Signal<boolean> = computed(
    () => this.host.isEmbedded || this.userContext.userInfo() !== null,
  );

  login(authToken: AuthToken): Observable<User> {
    this.checkStandalone('Sign-in');
    return this.http.post<LoginResponse>(this.urlProvider.resolve('login'), authToken).pipe(
      concatMap((loginResponse) => {
        switch (loginResponse.Code) {
          case LoginResponseCode.SUCCESS:
            return this.getUserInfo();
          case LoginResponseCode.ERROR:
            throw new Error(loginFailureMessage(loginResponse));
          default:
            throw new Error('Invalid authentication result code.');
        }
      }),
    );
  }

  logout(clearCookie: boolean = false): void {
    this.checkStandalone('Sign-out');
    if (clearCookie) {
      this.clearCookie()
        .pipe(finalize(() => this.logout(false)))
        .subscribe({
          error: (error: unknown) => console.error('Failed to clear the platform cookie:', error),
        });
      return;
    }

    this.userContext.destroy();
    this.rights.clearCache();
    this.schemas.clearCache();
    void this.router.navigate(['/login']);
  }

  checkAuthorization(returnUrl: string): true | UrlTree {
    if (this.isAuthenticated()) {
      return true;
    }
    return this.router.createUrlTree(['/login'], { queryParams: { returnUrl } });
  }

  private checkStandalone(action: string): void {
    if (this.host.isEmbedded) {
      throw new Error(
        `${action} is performed by the platform: inside a platform page the session is already open.`,
      );
    }
  }

  private getUserInfo(): Observable<User> {
    return this.userContext.initialize().pipe(
      map((result) => {
        const userInfo = this.userContext.userInfo();
        if (result && userInfo !== null) {
          return {
            Id: userInfo.id,
            ContactId: userInfo.contactId,
            ContactName: userInfo.contactName,
          };
        }
        throw new Error('User context not init');
      }),
    );
  }

  private clearCookie(): Observable<unknown> {
    return this.http.post(this.urlProvider.resolve('logout'), null);
  }
}
