import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { PlatformUrlProvider } from '@ep-crm/core';
import { sessionProbeContext } from './session-probe';

@Service()
export class PlatformHealthService {
  private readonly http = inject(HttpClient);
  private readonly urlProvider = inject(PlatformUrlProvider);

  private readonly serviceAlias: string = 'ping';

  check(): Observable<boolean> {
    return this.http
      .get(this.urlProvider.resolve(this.serviceAlias), {
        observe: 'response',
        responseType: 'text',
        context: sessionProbeContext(),
      })
      .pipe(
        map((response) => response.status >= 200 && response.status < 300),
        catchError(() => of(false)),
      );
  }
}
