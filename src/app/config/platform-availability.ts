import { computed, inject, Service, Signal, signal, WritableSignal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { PlatformHealthService } from '@ep-crm/devkit';

type Availability = 'unknown' | 'available' | 'unavailable';

@Service()
export class PlatformAvailabilityService {
  private readonly health = inject(PlatformHealthService);

  private readonly state: WritableSignal<Availability> = signal('unknown');

  readonly unavailable: Signal<boolean> = computed(() => this.state() === 'unavailable');

  verify(): Observable<boolean> {
    return this.health
      .check()
      .pipe(tap((alive) => this.state.set(alive ? 'available' : 'unavailable')));
  }
}
