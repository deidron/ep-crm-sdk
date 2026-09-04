import { provideHttpClient, withInterceptors, withXsrfConfiguration } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import {
  provideTranslateLoader,
  provideTranslateService,
  TranslateService,
} from '@ngx-translate/core';
import { TRANSLATE_HTTP_LOADER_CONFIG } from '@ngx-translate/http-loader';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { routes } from '@app/app.routes';
import { provideNavigationLoading } from '@app/loading';
import {
  PLATFORM_NAME,
  PlatformHost,
  UserContextService,
  WorkspaceUrlProvider,
} from '@ep-crm/devkit';
import { PlatformUrlProvider, ServiceRoutes } from '@ep-crm/core';
import { environment } from '../environments/environment';
import serviceRoutes from '@app/config/service-routes.json';
import { platformInterceptor } from '@app/config/platform-interceptor';
import { ProxyUrlProvider } from '@app/config/proxy-url-provider';
import { PlatformAvailabilityService } from '@app/config/platform-availability';

export function createUrlProvider(host: PlatformHost): PlatformUrlProvider {
  return host.isEmbedded
    ? new WorkspaceUrlProvider(serviceRoutes as ServiceRoutes)
    : new ProxyUrlProvider();
}

const supportedCultures: readonly string[] = ['ru-RU', 'en-US'];

const defaultCulture: string = 'ru-RU';

export function browserCulture(): string {
  const preferred: readonly string[] = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];
  for (const language of preferred) {
    const code: string = language.slice(0, 2).toLowerCase();
    const match: string | undefined = supportedCultures.find((culture) =>
      culture.toLowerCase().startsWith(code),
    );
    if (match) {
      return match;
    }
  }
  return defaultCulture;
}

export function interfaceCulture(userContext: UserContextService): string {
  return userContext.userInfo() ? userContext.currentCulture() : browserCulture();
}

export function initializeSession(): Observable<unknown> {
  const userContext: UserContextService = inject(UserContextService);
  const translate: TranslateService = inject(TranslateService);
  const availability: PlatformAvailabilityService = inject(PlatformAvailabilityService);
  return userContext.initialize().pipe(
    catchError(() => availability.verify().pipe(map(() => false))),
    switchMap(() => translate.use(interfaceCulture(userContext))),

    catchError(() => of(null)),
  );
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),

    provideNavigationLoading(),

    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withXsrfConfiguration({ cookieName: 'BPMCSRF', headerName: 'BPMCSRF' }),
      withInterceptors([platformInterceptor]),
    ),

    provideTranslateService({
      fallbackLang: defaultCulture,
    }),
    provideTranslateLoader(TranslateHttpLoader),
    {
      provide: TRANSLATE_HTTP_LOADER_CONFIG,
      useValue: { resources: [{ prefix: './locale/', suffix: '.json' }] },
    },

    { provide: PLATFORM_NAME, useValue: environment.platformName },
    { provide: PlatformUrlProvider, useFactory: createUrlProvider, deps: [PlatformHost] },
    provideAppInitializer(() => initializeSession()),
  ],
};
