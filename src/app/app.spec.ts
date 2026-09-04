import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { UserInfo } from '@ep-crm/core';
import { UserContextService } from '@ep-crm/devkit';
import { useBrowserLanguages } from '@app/testing/browser-languages.testing';
import { App } from './app';

const user: UserInfo = { contactName: 'John Smith' } as unknown as UserInfo;

interface Setup {
  fixture: ComponentFixture<App>;

  used: string[];
  userInfo: WritableSignal<UserInfo | null>;
}

function configure(culture: string): Setup {
  const used: string[] = [];
  const userInfo: WritableSignal<UserInfo | null> = signal<UserInfo | null>(null);

  TestBed.configureTestingModule({
    imports: [App],
    providers: [
      provideRouter([]),
      {
        provide: UserContextService,
        useValue: { userInfo, currentCulture: () => culture },
      },
      {
        provide: TranslateService,
        useValue: {
          use: (lang: string) => {
            used.push(lang);
            return of({});
          },
        },
      },
    ],
  });

  return { fixture: TestBed.createComponent(App), used, userInfo };
}

describe('App', () => {
  beforeEach(() => useBrowserLanguages(['ru-RU']));

  afterEach(() => TestBed.resetTestingModule());

  it('speaks the browser language before login', () => {
    const { fixture, used } = configure('en-US');

    fixture.detectChanges();

    expect(used).toEqual(['ru-RU']);
  });

  it('switches the language to the user culture on login', () => {
    const { fixture, used, userInfo } = configure('en-US');
    fixture.detectChanges();

    userInfo.set(user);
    fixture.detectChanges();

    expect(used).toEqual(['ru-RU', 'en-US']);
  });

  it('returns to the browser language on logout', () => {
    const { fixture, used, userInfo } = configure('en-US');
    fixture.detectChanges();
    userInfo.set(user);
    fixture.detectChanges();

    userInfo.set(null);
    fixture.detectChanges();

    expect(used).toEqual(['ru-RU', 'en-US', 'ru-RU']);
  });
});
