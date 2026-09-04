import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { UserContextService } from '@ep-crm/devkit';
import { UserProfile } from './user-profile';
import { UserProfileData } from './user-profile-data.model';
import { UserProfileStore } from './user-profile-store';
import { translationProviders, useRussianTranslations } from '@app/testing/translate.testing';

const profile: UserProfileData = {
  contact: {
    Id: 'c1',
    Name: 'John Smith',
    Email: 'i@example.com',
    Account: { displayValue: 'Acme Ltd.', value: 'a1' },
  },
  activityCount: 7,
  recentActivities: [{ Id: 'a1', Title: 'Call the customer' }],
};

function configure(data: UserProfileData | null): {
  fixture: ComponentFixture<UserProfile>;
  opened: WritableSignal<boolean>;
  close: ReturnType<typeof vi.fn>;
} {
  const opened: WritableSignal<boolean> = signal(false);
  const close = vi.fn(() => opened.set(false));
  TestBed.configureTestingModule({
    imports: [UserProfile],
    providers: [
      ...translationProviders,
      {
        provide: UserProfileStore,
        useValue: {
          opened,
          contactId: () => 'c1',
          open: () => opened.set(true),
          close,
          load: () => (data ? of(data) : throwError(() => new Error('no connection'))),
        },
      },
      {
        provide: UserContextService,
        useValue: {
          userInfo: () => ({ contactName: 'John Smith', cultureInfo: {} }),
          currentCulture: signal('ru-RU'),
        },
      },
    ],
  });
  useRussianTranslations();
  return { fixture: TestBed.createComponent(UserProfile), opened, close };
}

const pagedProfile: UserProfileData = {
  ...profile,
  recentActivities: [1, 2, 3, 4, 5].map((n) => ({ Id: `a${n}`, Title: `Task ${n}` })),
};

async function open(
  fixture: ComponentFixture<UserProfile>,
  opened: WritableSignal<boolean>,
): Promise<void> {
  fixture.detectChanges();
  opened.set(true);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
}

function text(fixture: ComponentFixture<UserProfile>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}

describe('UserProfile', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('renders nothing while closed', () => {
    const { fixture } = configure(profile);

    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('.modal')).toBeNull();
  });

  it('shows the card, the counter and the activities when open', async () => {
    const { fixture, opened } = configure(profile);
    fixture.detectChanges();

    opened.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.modal')).not.toBeNull();
    expect(host.querySelector('.modal-backdrop')).not.toBeNull();
    expect(text(fixture)).toContain('Профиль пользователя');
    expect(text(fixture)).toContain('John Smith');
    expect(text(fixture)).toContain('Acme Ltd.');
    expect(text(fixture)).toContain('Задач: 7');
    expect(text(fixture)).toContain('Call the customer');

    expect(text(fixture)).toContain('Язык интерфейса');
    expect(text(fixture)).toContain('ru-RU');
  });

  it('reports a loading error', async () => {
    const { fixture, opened } = configure(null);
    fixture.detectChanges();

    opened.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(text(fixture)).toContain('Не удалось загрузить профиль');
  });

  it('shows activities three at a time and pages through them', async () => {
    const { fixture, opened } = configure(pagedProfile);

    await open(fixture, opened);

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelectorAll('.list-group-item')).toHaveLength(3);
    expect(text(fixture)).toContain('Task 1');
    expect(text(fixture)).not.toContain('Task 4');
    expect(text(fixture)).toContain('1 / 2');

    host.querySelectorAll<HTMLButtonElement>('nav button')[1].click();
    fixture.detectChanges();

    expect(host.querySelectorAll('.list-group-item')).toHaveLength(2);
    expect(text(fixture)).toContain('Task 4');
    expect(text(fixture)).not.toContain('Task 1');
    expect(text(fixture)).toContain('2 / 2');
  });

  it('does not page through a single page of activities', async () => {
    const { fixture, opened } = configure(profile);

    await open(fixture, opened);

    expect((fixture.nativeElement as HTMLElement).querySelector('nav')).toBeNull();
  });

  it('closes with the button', async () => {
    const { fixture, opened, close } = configure(profile);
    fixture.detectChanges();
    opened.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.btn-close')!.click();
    fixture.detectChanges();

    expect(close).toHaveBeenCalled();
    expect((fixture.nativeElement as HTMLElement).querySelector('.modal')).toBeNull();
  });

  it('takes the modal mark off the page when it goes away with the dialog open', async () => {
    const { fixture, opened } = configure(profile);
    await open(fixture, opened);
    expect(document.body.classList.contains('modal-open')).toBe(true);

    fixture.destroy();

    expect(document.body.classList.contains('modal-open')).toBe(false);
  });

  it('listens for Escape only while it is open', async () => {
    const { fixture, opened, close } = configure(profile);
    fixture.detectChanges();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(close).not.toHaveBeenCalled();

    await open(fixture, opened);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(close).toHaveBeenCalled();
  });
  describe('focus', () => {
    it('keeps the keyboard inside the dialog', async () => {
      const { fixture, opened } = configure(profile);
      await open(fixture, opened);
      const host = fixture.nativeElement as HTMLElement;
      const dialog = host.querySelector<HTMLElement>('.modal')!;
      const focusables = Array.from(dialog.querySelectorAll<HTMLElement>('button'));
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      last.focus();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
      expect(document.activeElement).toBe(first);

      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }),
      );
      expect(document.activeElement).toBe(last);
    });

    it('gives the focus back to whatever opened it', async () => {
      const opener: HTMLButtonElement = document.createElement('button');
      document.body.appendChild(opener);
      opener.focus();
      const { fixture, opened } = configure(profile);

      await open(fixture, opened);
      expect(document.activeElement).not.toBe(opener);

      opened.set(false);
      fixture.detectChanges();

      expect(document.activeElement).toBe(opener);
      opener.remove();
    });
  });
});
