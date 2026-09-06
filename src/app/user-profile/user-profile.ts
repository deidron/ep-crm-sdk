import { DOCUMENT } from '@angular/common';
import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  linkedSignal,
  Signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { catchError, Observable } from 'rxjs';
import { Entity, EntityColumnValue, getLookupDisplayValue } from '@ep-crm/core';
import { CultureDateService, UserContextService } from '@ep-crm/devkit';
import { UserProfileData } from '@app/user-profile/user-profile-data.model';
import { UserProfileStore } from '@app/user-profile/user-profile-store';

interface ProfileField {
  captionKey: string;
  value: string;
}

interface ProfileActivity {
  id: string;
  title: string;
  startDate: string;
  status: string;
}

const emptyProfile: UserProfileData = { contact: null, activityCount: 0, recentActivities: [] };

const activityPageSize: number = 3;

const focusableSelector: string = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

@Component({
  selector: 'app-user-profile',
  imports: [TranslatePipe],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css',
})
export class UserProfile {
  private readonly service = inject(UserProfileStore);
  private readonly userContext = inject(UserContextService);
  private readonly document = inject(DOCUMENT);
  private readonly dates = inject(CultureDateService);

  readonly opened: Signal<boolean> = this.service.opened;

  private readonly profileResource = rxResource({
    params: () => (this.opened() ? (this.service.contactId() ?? undefined) : undefined),
    stream: () => this.load(),
    defaultValue: emptyProfile,
  });

  readonly loading: Signal<boolean> = this.profileResource.isLoading;

  readonly failed: Signal<boolean> = computed(() => this.profileResource.error() !== undefined);

  readonly userName: Signal<string> = computed(
    () => this.userContext.userInfo()?.contactName ?? '',
  );

  readonly activityCount: Signal<number> = computed(
    () => this.profileResource.value().activityCount,
  );

  readonly fields: Signal<ProfileField[]> = computed(() => {
    const contact: Entity | null = this.profileResource.value().contact;
    if (!contact) {
      return [];
    }
    return [
      { captionKey: 'profileFieldName', value: this.text(contact['Name']) },
      { captionKey: 'profileFieldEmail', value: this.text(contact['Email']) },
      { captionKey: 'profileFieldMobilePhone', value: this.text(contact['MobilePhone']) },
      { captionKey: 'profileFieldAccount', value: getLookupDisplayValue(contact['Account']) },
      {
        captionKey: 'profileFieldBirthDate',
        value: this.dates.render(contact['BirthDate'], 'date'),
      },
      {
        captionKey: 'profileFieldCreatedOn',
        value: this.dates.render(contact['CreatedOn'], 'datetime'),
      },

      { captionKey: 'profileFieldCulture', value: this.userContext.currentCulture() },
    ];
  });

  readonly activities: Signal<ProfileActivity[]> = computed(() =>
    this.profileResource.value().recentActivities.map((activity) => ({
      id: this.text(activity['Id']),
      title: this.text(activity['Title']),
      startDate: this.dates.render(activity['StartDate'], 'datetime'),
      status: getLookupDisplayValue(activity['Status']),
    })),
  );

  private readonly pageState: WritableSignal<number> = linkedSignal<ProfileActivity[], number>({
    source: this.activities,
    computation: () => 0,
  });

  readonly pageCount: Signal<number> = computed(() =>
    Math.max(1, Math.ceil(this.activities().length / activityPageSize)),
  );

  readonly page: Signal<number> = computed(() => Math.min(this.pageState(), this.pageCount() - 1));

  readonly pagedActivities: Signal<ProfileActivity[]> = computed(() => {
    const start: number = this.page() * activityPageSize;
    return this.activities().slice(start, start + activityPageSize);
  });

  readonly empty: Signal<boolean> = computed(
    () => !this.loading() && !this.failed() && this.fields().length === 0,
  );

  private readonly dialog = viewChild<ElementRef<HTMLElement>>('dialog');

  constructor() {
    effect((onCleanup) => {
      const dialog: HTMLElement | undefined = this.opened()
        ? this.dialog()?.nativeElement
        : undefined;
      if (!dialog) {
        return;
      }
      const body: HTMLElement = this.document.body;
      const opener: HTMLElement | null = this.activeElement();
      const onKeydown = (event: KeyboardEvent): void => this.onDocumentKeydown(dialog, event);

      body.classList.add('modal-open');
      this.document.addEventListener('keydown', onKeydown);
      this.focusables(dialog)[0]?.focus();

      onCleanup(() => {
        body.classList.remove('modal-open');
        this.document.removeEventListener('keydown', onKeydown);

        opener?.focus();
      });
    });
  }

  private onDocumentKeydown(dialog: HTMLElement, event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.onClose();
      return;
    }
    if (event.key === 'Tab') {
      this.keepFocusInside(dialog, event);
    }
  }

  private keepFocusInside(dialog: HTMLElement, event: KeyboardEvent): void {
    const focusables: HTMLElement[] = this.focusables(dialog);
    if (focusables.length === 0) {
      return;
    }
    const first: HTMLElement = focusables[0];
    const last: HTMLElement = focusables[focusables.length - 1];
    const active: HTMLElement | null = this.activeElement();
    if (!active || !dialog.contains(active)) {
      event.preventDefault();
      first.focus();
      return;
    }
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
      return;
    }
    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private focusables(dialog: HTMLElement): HTMLElement[] {
    return Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector));
  }

  private activeElement(): HTMLElement | null {
    const active: Element | null = this.document.activeElement;
    return active instanceof HTMLElement ? active : null;
  }

  onClose(): void {
    this.service.close();
  }

  onPrevPage(): void {
    this.pageState.set(Math.max(0, this.page() - 1));
  }

  onNextPage(): void {
    this.pageState.set(Math.min(this.pageCount() - 1, this.page() + 1));
  }

  private load(): Observable<UserProfileData> {
    return this.service.load().pipe(
      catchError((error: unknown) => {
        console.error('Failed to load the profile:', error);
        throw error;
      }),
    );
  }

  private text(value: EntityColumnValue): string {
    if (value === null || value === undefined || typeof value === 'object') {
      return '';
    }
    return String(value);
  }
}
