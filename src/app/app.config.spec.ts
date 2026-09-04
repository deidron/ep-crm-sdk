import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom, Observable, of, throwError } from 'rxjs';
import { PlatformHealthService, UserContextService } from '@ep-crm/devkit';
import { PlatformAvailabilityService } from '@app/config/platform-availability';
import { useBrowserLanguages } from '@app/testing/browser-languages.testing';
import { browserCulture, initializeSession } from './app.config';

interface Setup {
  used: string[];

  checks: () => number;
  availability: () => PlatformAvailabilityService;
  run: () => Promise<unknown>;
}

function configure(
  culture: string,
  sessionFails: boolean = false,
  platformAlive: boolean = true,
): Setup {
  const used: string[] = [];
  let checks: number = 0;

  TestBed.configureTestingModule({
    providers: [
      PlatformAvailabilityService,
      {
        provide: PlatformHealthService,
        useValue: {
          check: (): Observable<boolean> => {
            checks += 1;
            return of(platformAlive);
          },
        },
      },
      {
        provide: UserContextService,
        useValue: {
          initialize: () => (sessionFails ? throwError(() => new Error('no session')) : of(true)),
          currentCulture: () => culture,
          userInfo: () => (sessionFails ? null : { contactName: 'John Smith' }),
        },
      },
      {
        provide: TranslateService,
        useValue: {
          use: (lang: string): Observable<unknown> => {
            used.push(lang);
            return of({});
          },
        },
      },
    ],
  });

  return {
    used,
    checks: () => checks,
    availability: () => TestBed.inject(PlatformAvailabilityService),
    run: () => firstValueFrom(TestBed.runInInjectionContext(() => initializeSession())),
  };
}

describe('browserCulture', () => {
  it('takes the first browser language that has a dictionary', () => {
    useBrowserLanguages(['en-GB', 'ru-RU']);

    expect(browserCulture()).toBe('en-US');
  });

  it('compares the language code only: ru-UA is served by the ru-RU dictionary', () => {
    useBrowserLanguages(['ru-UA']);

    expect(browserCulture()).toBe('ru-RU');
  });

  it('falls back to the default language when no dictionary fits', () => {
    useBrowserLanguages(['de-DE', 'fr-FR']);

    expect(browserCulture()).toBe('ru-RU');
  });
});

describe('initializeSession', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('takes the interface language from the user culture', async () => {
    useBrowserLanguages(['de-DE']);
    const { used, run } = configure('ru-RU');

    await run();

    expect(used).toEqual(['ru-RU']);
  });

  it('uses the browser language without a session, not the context fallback', async () => {
    useBrowserLanguages(['ru-RU']);
    const { used, run } = configure('en-US', true);

    await run();

    expect(used).toEqual(['ru-RU']);
  });

  describe('the health check', () => {
    it('is not asked while the session is fine', async () => {
      useBrowserLanguages(['ru-RU']);
      const { checks, availability, run } = configure('ru-RU');

      await run();

      expect(checks()).toBe(0);
      expect(availability().unavailable()).toBe(false);
    });

    it('is asked once when the session fails', async () => {
      useBrowserLanguages(['ru-RU']);
      const { checks, run } = configure('ru-RU', true);

      await run();

      expect(checks()).toBe(1);
    });

    it('leaves the platform available when it answers', async () => {
      useBrowserLanguages(['ru-RU']);
      const { availability, run } = configure('ru-RU', true, true);

      await run();

      expect(availability().unavailable()).toBe(false);
    });

    it('marks the platform unavailable when it stays silent', async () => {
      useBrowserLanguages(['ru-RU']);
      const { availability, run } = configure('ru-RU', true, false);

      await run();

      expect(availability().unavailable()).toBe(true);
    });

    it('still settles the interface language when the platform is down', async () => {
      useBrowserLanguages(['ru-RU']);
      const { used, run } = configure('en-US', true, false);

      await run();

      expect(used).toEqual(['ru-RU']);
    });
  });
});
