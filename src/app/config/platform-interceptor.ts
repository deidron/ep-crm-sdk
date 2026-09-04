import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { PlatformHost, SESSION_PROBE } from '@ep-crm/devkit';
import { AuthorizationService } from '@app/authorization/authorization';

export function isSessionExpired(error: HttpErrorResponse): boolean {
  if (error.status === 401) {
    return true;
  }
  if (error.status !== 200) {
    return false;
  }
  const body: unknown = error.error;
  if (body instanceof SyntaxError) {
    return true;
  }

  return (body as { error?: unknown } | null)?.error instanceof SyntaxError;
}

export const platformInterceptor: HttpInterceptorFn = (request, next) => {
  const router: Router = inject(Router);
  const authorization: AuthorizationService = inject(AuthorizationService);
  const host: PlatformHost = inject(PlatformHost);
  const marked = request.clone({
    headers: request.headers.set('X-Request-Source', 'ajax-provider'),
  });

  return next(marked).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && !(error.error instanceof ErrorEvent)) {
        if (isSessionExpired(error)) {
          if (!request.context.get(SESSION_PROBE) && host.isStandalone) {
            authorization.logout();
          }
        } else if (error.status === 403) {
          void router.navigateByUrl('/unauthorized');
        }
      }
      return throwError(() => error);
    }),
  );
};
