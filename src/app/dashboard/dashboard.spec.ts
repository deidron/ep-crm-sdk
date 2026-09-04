import { ComponentRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { EntitySchemaResponse, PlatformName, PlatformUrlProvider } from '@ep-crm/core';
import { PlatformHost, UserContextService } from '@ep-crm/devkit';
import { Dashboard } from './dashboard';
import { translationProviders } from '@app/testing/translate.testing';

interface UserStub {
  contactName: string;
  timeZoneId: string;
}

function configure(
  user: UserStub | null,
  platformName: PlatformName | null,
): ComponentRef<Dashboard> {
  TestBed.configureTestingModule({
    imports: [Dashboard],
    providers: [
      ...translationProviders,
      provideRouter([]),
      { provide: PlatformUrlProvider, useValue: { resolve: (alias: string) => `/crm/${alias}` } },
      {
        provide: PlatformHost,
        useValue: { name: platformName, isEmbedded: false, isStandalone: true },
      },
      {
        provide: UserContextService,
        useValue: { userInfo: () => user, currentCulture: () => 'ru-RU' },
      },
    ],
  });
  return TestBed.createComponent(Dashboard).componentRef;
}

function factOf(component: Dashboard, captionKey: string): string | number | undefined {
  return component.connection().find((fact) => fact.captionKey === captionKey)?.value;
}

describe('Dashboard: the connection card', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('shows what the application knows about the connection', () => {
    const ref = configure(
      { contactName: 'Supervisor', timeZoneId: 'Russian Standard Time' },
      PlatformName.BPMSoft,
    );
    ref.setInput('schemas', [{}, {}] as EntitySchemaResponse[]);

    expect(factOf(ref.instance, 'connectionPlatform')).toBe(PlatformName.BPMSoft);
    expect(factOf(ref.instance, 'connectionUser')).toBe('Supervisor');
    expect(factOf(ref.instance, 'connectionCulture')).toBe('ru-RU');
    expect(factOf(ref.instance, 'connectionTimeZone')).toBe('Russian Standard Time');
    expect(factOf(ref.instance, 'connectionSchemas')).toBe(2);
  });

  it('puts a dash where the context has nothing yet', () => {
    const ref = configure(null, null);

    expect(factOf(ref.instance, 'connectionPlatform')).toBe('—');
    expect(factOf(ref.instance, 'connectionUser')).toBe('—');
    expect(factOf(ref.instance, 'connectionTimeZone')).toBe('—');
    expect(factOf(ref.instance, 'connectionSchemas')).toBe(0);
  });

  it('follows the schemas as they arrive', () => {
    const ref = configure({ contactName: 'Supervisor', timeZoneId: 'UTC' }, PlatformName.Terrasoft);
    expect(factOf(ref.instance, 'connectionSchemas')).toBe(0);

    ref.setInput('schemas', [{}, {}, {}] as EntitySchemaResponse[]);

    expect(factOf(ref.instance, 'connectionSchemas')).toBe(3);
  });
});
