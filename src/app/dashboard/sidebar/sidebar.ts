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
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthorizationService } from '@app/authorization/authorization';
import { UserProfileStore } from '@app/user-profile';
import { PlatformHost, UserContextService } from '@ep-crm/devkit';
import {
  EntitySchemaResponse,
  LocalizableString,
  PlatformUrlProvider,
  getLocalizedString,
  isEmptyGuid,
} from '@ep-crm/core';

const defaultUserImagePath: string = 'assets/img/default_photo.svg';

const narrowViewportQuery: string = '(max-width: 767.98px)';

function matchNarrowViewport(): MediaQueryList | null {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return null;
  }
  return window.matchMedia(narrowViewportQuery);
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  private readonly service = inject(AuthorizationService);
  private readonly userContext = inject(UserContextService);
  private readonly host = inject(PlatformHost);
  private readonly urlProvider = inject(PlatformUrlProvider);
  private readonly profile = inject(UserProfileStore);
  private readonly destroyRef = inject(DestroyRef);

  private readonly narrowViewport: MediaQueryList | null = matchNarrowViewport();

  readonly entitySchemas: InputSignal<EntitySchemaResponse[]> = input<EntitySchemaResponse[]>([]);

  readonly collapsed: WritableSignal<boolean> = signal(this.narrowViewport?.matches ?? false);

  readonly logoImagePath: string = 'assets/img/angular_white.svg';

  readonly userImagePath: Signal<string> = computed(() => {
    const photo: string | undefined = this.userContext.userInfo()?.photoId;
    if (isEmptyGuid(photo)) {
      return defaultUserImagePath;
    }
    return `${this.urlProvider.resolve('entityImg')}/${photo}`;
  });

  constructor() {
    this.subscribeOnViewportChange();
  }

  get canSignOut(): boolean {
    return this.host.isStandalone;
  }

  getCaption(caption: LocalizableString): string {
    return getLocalizedString(caption, this.userContext.currentCulture());
  }

  onCollapseButtonClick(): void {
    this.collapsed.update((collapsed) => !collapsed);
  }

  onMenuItemClick(): void {
    if (this.narrowViewport?.matches) {
      this.collapsed.set(true);
    }
  }

  onProfile(): void {
    this.profile.open();
  }

  onSignOut(): void {
    this.service.logout(true);
  }

  private subscribeOnViewportChange(): void {
    const query: MediaQueryList | null = this.narrowViewport;
    if (!query) {
      return;
    }
    const listener = (event: MediaQueryListEvent): void => this.collapsed.set(event.matches);
    query.addEventListener('change', listener);
    this.destroyRef.onDestroy(() => query.removeEventListener('change', listener));
  }
}
