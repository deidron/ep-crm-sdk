import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginResponse, LoginResponseCode, PlatformUrlProvider, UserInfo } from '@ep-crm/core';
import { PlatformHost, RightsService, UserContextService } from '@ep-crm/devkit';
import { AuthorizationService } from './authorization';

const userInfo: UserInfo = {
  id: 'admin-unit-id',
  contactId: 'contact-id',
  contactName: 'Test',
  cultureInfo: {
    sysCultureId: '1',
    sysCultureName: 'ru-RU',
    decimalSeparator: ',',
    thousandSeparator: ' ',

    dateTimeFormat: {
      dateSeparator: '.',
      shortDatePattern: 'dd.MM.yyyy',
      shortTimePattern: 'HH:mm',
      firstDayOfWeek: 1,
      amDesignator: 'AM',
      pmDesignator: 'PM',
    },
  },
  defCultureInfo: {
    sysCultureId: '1',
    sysCultureName: 'ru-RU',
    decimalSeparator: ',',
    thousandSeparator: ' ',

    dateTimeFormat: null,
  },
  isSSP: false,
  timeZoneId: 'Russian Standard Time',
  timeZoneOffsetHours: 3,
  photoId: '00000000-0000-0000-0000-000000000000',
};

describe('AuthorizationService', () => {
  let service: AuthorizationService;
  let context: WritableSignal<UserInfo | null>;
  let clearCache: ReturnType<typeof vi.fn>;
  let destroy: ReturnType<typeof vi.fn>;
  let navigate: ReturnType<typeof vi.fn>;
  let createUrlTree: ReturnType<typeof vi.fn>;

  function configure(options: {
    isStandalone: boolean;
    signedIn: boolean;

    cookieFails?: boolean;

    loginResponse?: Partial<LoginResponse>;
  }): void {
    context = signal(options.signedIn ? userInfo : null);
    clearCache = vi.fn();
    destroy = vi.fn(() => context.set(null));
    navigate = vi.fn();
    createUrlTree = vi.fn(() => ({}) as UrlTree);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HttpClient,
          useValue: {
            post: () => {
              if (options.cookieFails) {
                return throwError(() => new Error('gateway is down'));
              }
              return of(options.loginResponse ?? null);
            },
          },
        },
        { provide: Router, useValue: { navigate, createUrlTree } },
        { provide: UserContextService, useValue: { userInfo: context.asReadonly(), destroy } },
        { provide: RightsService, useValue: { clearCache } },
        {
          provide: PlatformHost,
          useValue: { isStandalone: options.isStandalone, isEmbedded: !options.isStandalone },
        },
        { provide: PlatformUrlProvider, useValue: { resolve: (alias: string) => `/crm/${alias}` } },
      ],
    });
    service = TestBed.inject(AuthorizationService);
  }

  afterEach(() => TestBed.resetTestingModule());

  describe('authorization flag', () => {
    it('follows the user context', () => {
      configure({ isStandalone: true, signedIn: true });
      expect(service.isAuthenticated()).toBe(true);
      context.set(null);
      expect(service.isAuthenticated()).toBe(false);
    });

    it('treats the user as unauthorized without a context', () => {
      configure({ isStandalone: true, signedIn: false });
      expect(service.isAuthenticated()).toBe(false);
    });

    it('relies on the platform session inside a platform page', () => {
      configure({ isStandalone: false, signedIn: false });
      expect(service.isAuthenticated()).toBe(true);
    });

    it('writes nothing to browser storage', () => {
      const setItem = vi.spyOn(Storage.prototype, 'setItem');
      configure({ isStandalone: true, signedIn: true });
      service.isAuthenticated();
      expect(setItem).not.toHaveBeenCalled();
      setItem.mockRestore();
    });
  });

  describe('checkAuthorization', () => {
    it('lets an authorized user through', () => {
      configure({ isStandalone: true, signedIn: true });
      expect(service.checkAuthorization('/dashboard')).toBe(true);
    });

    it('sends an unauthorized user to the login form with a return address', () => {
      configure({ isStandalone: true, signedIn: false });
      service.checkAuthorization('/dashboard/Contact');
      expect(createUrlTree).toHaveBeenCalledWith(['/login'], {
        queryParams: { returnUrl: '/dashboard/Contact' },
      });
    });
  });

  describe('login', () => {
    function failureMessage(response: Partial<LoginResponse>): string | undefined {
      configure({ isStandalone: true, signedIn: false, loginResponse: response });
      let message: string | undefined;
      service.login({ UserName: 'u', UserPassword: 'p' }).subscribe({
        error: (error: Error) => {
          message = error.message;
        },
      });
      return message;
    }

    it('shows the reason the platform gives for refusing', () => {
      const message: string | undefined = failureMessage({
        Code: LoginResponseCode.ERROR,
        Exception: { Message: 'Wrong login or password' },
      } as Partial<LoginResponse>);

      expect(message).toBe('Wrong login or password');
    });

    it('still reports a refusal that carries no exception at all', () => {
      const message: string | undefined = failureMessage({ Code: LoginResponseCode.ERROR });

      expect(message).toBe('Authentication failed.');
    });
  });

  describe('logout', () => {
    it('resets the context and the rights cache and goes to the login form', () => {
      configure({ isStandalone: true, signedIn: true });
      service.logout();
      expect(destroy).toHaveBeenCalled();
      expect(clearCache).toHaveBeenCalled();
      expect(navigate).toHaveBeenCalledWith(['/login']);
      expect(service.isAuthenticated()).toBe(false);
    });

    it('resets everything when the cookie is cleared along the way', () => {
      configure({ isStandalone: true, signedIn: true });
      service.logout(true);
      expect(destroy).toHaveBeenCalled();
      expect(clearCache).toHaveBeenCalled();
    });

    it('closes the local session even when the cookie cannot be cleared', () => {
      const logged = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      configure({ isStandalone: true, signedIn: true, cookieFails: true });

      service.logout(true);

      expect(destroy).toHaveBeenCalled();
      expect(clearCache).toHaveBeenCalled();
      expect(navigate).toHaveBeenCalledWith(['/login']);
      expect(service.isAuthenticated()).toBe(false);
      logged.mockRestore();
    });

    it('leaves signing out to the platform inside a platform page', () => {
      configure({ isStandalone: false, signedIn: true });
      expect(() => service.logout()).toThrow();
      expect(destroy).not.toHaveBeenCalled();
      expect(clearCache).not.toHaveBeenCalled();
    });
  });
});
