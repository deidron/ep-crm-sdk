import { DestroyRef, EnvironmentProviders, inject, provideAppInitializer } from '@angular/core';
import {
  Event,
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
} from '@angular/router';
import { Subscription } from 'rxjs';
import { LoadingService } from '@app/loading/loading';

const showDelayMs: number = 150;

export function provideNavigationLoading(): EnvironmentProviders {
  return provideAppInitializer(() => {
    const router: Router = inject(Router);
    const loader: LoadingService = inject(LoadingService);

    let timer: ReturnType<typeof setTimeout> | null = null;

    const stop = (): void => {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
      loader.hide();
    };

    const subscription: Subscription = router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        timer ??= setTimeout(() => {
          timer = null;
          loader.show();
        }, showDelayMs);
        return;
      }
      if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        stop();
      }
    });

    inject(DestroyRef).onDestroy(() => {
      subscription.unsubscribe();
      stop();
    });
  });
}
