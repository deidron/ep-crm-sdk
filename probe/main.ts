import { provideHttpClient, withXsrfConfiguration } from '@angular/common/http';
import { ApplicationRef, Injector, provideZonelessChangeDetection } from '@angular/core';
import { createApplication } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';
import {
  PLATFORM_NAMES,
  PlatformName,
  PlatformUrlProvider,
  SelectQuery,
  ServiceRoutes,
} from '@ep-crm/core';
import {
  BatchQueryFactory,
  getPlatformGlobal,
  getPlatformGlobalName,
  PLATFORM_NAME,
  PlatformHost,
  QueryExecutor,
  UserContextService,
  WorkspaceUrlProvider,
} from '@ep-crm/devkit';
import * as serviceRoutes from '@app/config/service-routes.json';

interface CheckResult {
  name: string;
  ok: boolean;
  detail: unknown;
}

async function check(name: string, run: () => Promise<unknown> | unknown): Promise<CheckResult> {
  try {
    return { name, ok: true, detail: await run() };
  } catch (error) {
    return { name, ok: false, detail: error instanceof Error ? error.message : error };
  }
}

function createProbeInjector(): Promise<ApplicationRef> {
  return createApplication({
    providers: [
      provideZonelessChangeDetection(),
      provideHttpClient(withXsrfConfiguration({ cookieName: 'BPMCSRF', headerName: 'BPMCSRF' })),
      { provide: PLATFORM_NAME, useValue: getPlatformGlobalName() ?? null },
      {
        provide: PlatformUrlProvider,
        useFactory: () => new WorkspaceUrlProvider(serviceRoutes as ServiceRoutes),
      },
    ],
  });
}

function readCsrfCookie(): string | null {
  return (document.cookie.match(/BPMCSRF=([^;]+)/) ?? [])[1] ?? null;
}

export async function run(): Promise<CheckResult[]> {
  const app: ApplicationRef = await createProbeInjector();
  const injector: Injector = app.injector;
  const results: CheckResult[] = [];

  results.push(
    await check('platform global', () => {
      const name: PlatformName | undefined = getPlatformGlobalName();
      const global = getPlatformGlobal();
      if (!global) {
        throw new Error(
          `No platform global (${PLATFORM_NAMES.join(' or ')}) on the page: the code is not embedded.`,
        );
      }
      return {
        name,
        loaderBaseUrl: global.loaderBaseUrl,
        workspaceBaseUrl: global.workspaceBaseUrl,
      };
    }),
  );

  results.push(
    await check('PlatformHost', () => {
      const host: PlatformHost = injector.get(PlatformHost);
      return { isEmbedded: host.isEmbedded, isStandalone: host.isStandalone, name: host.name };
    }),
  );

  results.push(
    await check('url resolution', () => {
      const provider: PlatformUrlProvider = injector.get(PlatformUrlProvider);
      return {
        currentUserInfo: provider.resolve('currentUserInfo'),
        select: provider.resolve('select'),
        batch: provider.resolve('batch'),
        entityImg: provider.resolve('entityImg'),
      };
    }),
  );

  results.push(
    await check('xsrf: cookie and address', () => {
      const provider: PlatformUrlProvider = injector.get(PlatformUrlProvider);
      const url: string = provider.resolve('select');
      return {
        cookiePresent: readCsrfCookie() !== null,
        absoluteUrl: /^https?:\/\//.test(url),
        headerWillBeSent: !/^https?:\/\//.test(url),
      };
    }),
  );

  results.push(
    await check('currentUserInfo (devkit)', async () => {
      const context: UserContextService = injector.get(UserContextService);
      const success: boolean = await firstValueFrom(context.initialize());
      return {
        success,
        contact: context.userInfo()?.contactName,
        culture: context.currentCulture(),
      };
    }),
  );

  results.push(
    await check('SelectQuery (core + devkit)', async () => {
      const executor: QueryExecutor = injector.get(QueryExecutor);
      const query: SelectQuery = new SelectQuery('Contact');
      query.addColumn('Id');
      query.addColumn('Name');
      query.addColumn('CreatedOn');
      query.rowCount = 3;
      const response = await firstValueFrom(executor.executeQuery(query));
      return { rows: response.rows?.length, first: response.rows?.[0] };
    }),
  );

  results.push(
    await check('BatchQuery __type', async () => {
      const factory: BatchQueryFactory = injector.get(BatchQueryFactory);
      const batch = factory.create();
      const query: SelectQuery = new SelectQuery('Contact');
      query.addColumn('Id');
      query.rowCount = 1;
      batch.addNamed('contact', query);
      const body = JSON.parse(batch.serialize()) as { items: { __type: string }[] };
      const executor: QueryExecutor = injector.get(QueryExecutor);
      await firstValueFrom(executor.executeQuery(batch));
      return { sentType: body.items[0].__type, result: batch.getResult('contact') !== undefined };
    }),
  );

  results.push(
    await check('raw fetch with the header', async () => {
      const provider: PlatformUrlProvider = injector.get(PlatformUrlProvider);
      const query: SelectQuery = new SelectQuery('Contact');
      query.addColumn('Id');
      query.rowCount = 1;
      const response: Response = await fetch(provider.resolve('select'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          BPMCSRF: readCsrfCookie() ?? '',
        },
        body: query.serialize(),
      });
      return { status: response.status, body: await response.json() };
    }),
  );

  console.table(results.map(({ name, ok }) => ({ name, ok })));
  for (const result of results) {
    console.log(result.ok ? '[ok]' : '[fail]', result.name, result.detail);
  }
  return results;
}

(globalThis as unknown as Record<string, unknown>)['EpCrmProbe'] = { run };
