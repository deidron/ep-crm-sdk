import {
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  InputSignal,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { filter } from 'rxjs';
import { EntitySchemaResponse } from '@ep-crm/core';
import { PlatformHost, UserContextService } from '@ep-crm/devkit';
import { Sidebar } from '@app/dashboard/sidebar/sidebar';
import { UserProfile } from '@app/user-profile';

interface ConnectionFact {
  captionKey: string;
  value: string | number;
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet, TranslatePipe, Sidebar, UserProfile],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly host = inject(PlatformHost);
  private readonly userContext = inject(UserContextService);

  private readonly defaultUrl: string = '/dashboard';

  readonly schemas: InputSignal<EntitySchemaResponse[]> = input<EntitySchemaResponse[]>([]);

  readonly isDefaultUrl: WritableSignal<boolean> = signal(false);

  readonly connection: Signal<ConnectionFact[]> = computed(() => {
    const user = this.userContext.userInfo();
    return [
      { captionKey: 'connectionPlatform', value: this.host.name ?? '—' },
      { captionKey: 'connectionUser', value: user?.contactName ?? '—' },
      { captionKey: 'connectionCulture', value: this.userContext.currentCulture() },
      { captionKey: 'connectionTimeZone', value: user?.timeZoneId ?? '—' },
      { captionKey: 'connectionSchemas', value: this.schemas().length },
    ];
  });

  constructor() {
    this.isDefaultUrl.set(this.isActiveRoute());
    this.subscribeOnNavigationEnd();
  }

  private isActiveRoute(): boolean {
    return this.router.isActive(this.defaultUrl, {
      paths: 'exact',
      queryParams: 'exact',
      fragment: 'ignored',
      matrixParams: 'ignored',
    });
  }

  private subscribeOnNavigationEnd(): void {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.isDefaultUrl.set(this.isActiveRoute()));
  }
}
