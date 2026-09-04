import { HttpClient } from '@angular/common/http';
import { computed, inject, Service, Signal, signal, WritableSignal } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { UserInfo } from '@ep-crm/core';
import { PlatformUrlProvider } from '@ep-crm/core';
import { UserInfoResponse } from '@ep-crm/core';
import { sessionProbeContext } from './session-probe';

@Service()
export class UserContextService {
  private readonly http = inject(HttpClient);
  private readonly urlProvider = inject(PlatformUrlProvider);

  private readonly serviceAlias: string = 'currentUserInfo';

  private readonly context: WritableSignal<UserInfo | null> = signal(null);

  readonly userInfo: Signal<UserInfo | null> = this.context.asReadonly();

  readonly currentCulture: Signal<string> = computed(
    () => this.context()?.cultureInfo.sysCultureName ?? 'en-US',
  );

  initialize(): Observable<boolean> {
    if (this.context() !== null) {
      return of(true);
    }
    return this.getCurrentUserInfo().pipe(
      map((data) => {
        if (data.success) {
          this.context.set(data.userInfo);
        }
        return data.success;
      }),
    );
  }

  destroy(): void {
    this.context.set(null);
  }

  getCurrentUserInfo(): Observable<UserInfoResponse> {
    return this.http.post<UserInfoResponse>(this.urlProvider.resolve(this.serviceAlias), null, {
      context: sessionProbeContext(),
    });
  }
}
