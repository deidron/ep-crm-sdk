import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { PlatformUrlProvider } from '@ep-crm/core';
import { AuthorizationService } from '@app/authorization/authorization';
import { translationProviders, useRussianTranslations } from '@app/testing/translate.testing';
import { ErrorPage } from '@app/errors';
import { routes } from './app.routes';

describe('routes', () => {
  let harness: RouterTestingHarness;

  let returnUrl: string | null;

  beforeEach(async () => {
    returnUrl = null;
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        translationProviders,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PlatformUrlProvider, useValue: { resolve: (alias: string) => `/crm/${alias}` } },
        {
          provide: AuthorizationService,
          useFactory: () => {
            const router: Router = TestBed.inject(Router);
            return {
              isAuthenticated: signal(false),
              checkAuthorization: (url: string): UrlTree => {
                returnUrl = url;
                return router.createUrlTree(['/login'], { queryParams: { returnUrl: url } });
              },
            };
          },
        },
      ],
    });
    useRussianTranslations();
    harness = await RouterTestingHarness.create();
  });

  afterEach(() => TestBed.resetTestingModule());

  it('keeps the query string of the address it turned the visitor away from', async () => {
    await harness.navigateByUrl('/dashboard/Contact?search=abc');

    expect(returnUrl).toBe('/dashboard/Contact?search=abc');
  });

  it('has a page behind the address the 403 handler navigates to', async () => {
    const component = await harness.navigateByUrl('/unauthorized', ErrorPage);

    expect(component).toBeInstanceOf(ErrorPage);
    expect(harness.routeNativeElement?.textContent).toContain('Доступ запрещён');
  });

  it('answers an unknown address instead of leaving a blank page', async () => {
    const component = await harness.navigateByUrl('/no-such-page', ErrorPage);

    expect(component).toBeInstanceOf(ErrorPage);
    expect(harness.routeNativeElement?.textContent).toContain('Страница не найдена');
  });
});
