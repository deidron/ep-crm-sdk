import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  ComparisonType,
  DataValueType,
  DeleteQuery,
  FilterUtils,
  IncompleteFiltersException,
  PlatformName,
  PlatformUrlProvider,
  SelectQuery,
  UpdateQuery,
} from '@ep-crm/core';
import { PlatformHost } from './platform-host';
import { QueryExecutor } from './query-executor';

describe('QueryExecutor', () => {
  let executor: QueryExecutor;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PlatformUrlProvider, useValue: { resolve: (alias: string) => `/crm/${alias}` } },
      ],
    });
    executor = TestBed.inject(QueryExecutor);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    backend.verify();
    TestBed.resetTestingModule();
  });

  it('reports a query build error into the stream instead of throwing outwards', async () => {
    const query: DeleteQuery = new DeleteQuery('Contact');
    query.addFilter(
      'byEmail',
      FilterUtils.createColumnFilterWithParameter(ComparisonType.EQUAL, 'Email', null),
    );
    let received: unknown = null;

    expect(() =>
      executor.executeQuery(query).subscribe({ error: (e) => (received = e) }),
    ).not.toThrow();

    expect(received).toBeInstanceOf(IncompleteFiltersException);
  });

  it('does not touch the network when the query could not be assembled', () => {
    const query: DeleteQuery = new DeleteQuery('Contact');
    query.addFilter(
      'byEmail',
      FilterUtils.createColumnFilterWithParameter(ComparisonType.EQUAL, 'Email', null),
    );

    executor.executeQuery(query).subscribe({ error: () => undefined });

    backend.expectNone('/crm/delete');
  });

  it('builds the request body on subscription rather than on the call', () => {
    const query: SelectQuery = new SelectQuery('Contact');
    const stream = executor.executeQuery(query);
    query.addColumn('Name');

    stream.subscribe({ error: () => undefined });

    const request = backend.expectOne('/crm/select');
    expect(JSON.parse(request.request.body)['columns']['items']).toHaveProperty('Name');
    request.flush({ rows: [], rowConfig: {}, success: true });
  });
});

describe('QueryExecutor: record lock control', () => {
  const recordId: string = '11111111-1111-1111-1111-111111111111';

  let backend: HttpTestingController;

  function configure(platformName: PlatformName | null): QueryExecutor {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PlatformUrlProvider, useValue: { resolve: (alias: string) => `/crm/${alias}` } },
        { provide: PlatformHost, useValue: { name: platformName } },
      ],
    });
    backend = TestBed.inject(HttpTestingController);
    return TestBed.inject(QueryExecutor);
  }

  function targetedDelete(): DeleteQuery {
    const query: DeleteQuery = new DeleteQuery('Contact');
    query.enablePrimaryColumnFilter(recordId);
    return query;
  }

  function clientType(alias: string): string | null {
    const request = backend.expectOne(`/crm/${alias}`);
    const header: string | null = request.request.headers.get('X-Client-Type');
    request.flush({ success: true });
    return header;
  }

  afterEach(() => {
    backend.verify();
    TestBed.resetTestingModule();
  });

  it('marks a targeted delete where the check exists', () => {
    const executor: QueryExecutor = configure(PlatformName.BPMSoft);

    executor.executeQuery(targetedDelete()).subscribe({ error: () => undefined });

    expect(clientType('delete')).toBe('web');
  });

  it('marks a targeted update', () => {
    const executor: QueryExecutor = configure(PlatformName.BPMSoft);
    const query: UpdateQuery = new UpdateQuery('Contact');
    query.setParameterValue('Name', 'Brown', DataValueType.TEXT);
    query.enablePrimaryColumnFilter(recordId);

    executor.executeQuery(query).subscribe({ error: () => undefined });

    expect(clientType('update')).toBe('web');
  });

  it('does not mark a delete driven by an arbitrary condition', () => {
    const executor: QueryExecutor = configure(PlatformName.BPMSoft);
    const query: DeleteQuery = new DeleteQuery('Contact');
    query.addFilter(
      'byName',
      FilterUtils.createColumnFilterWithParameter(ComparisonType.EQUAL, 'Name', 'Smith'),
    );

    executor.executeQuery(query).subscribe({ error: () => undefined });

    expect(clientType('delete')).toBeNull();
  });

  it('does not mark a select', () => {
    const executor: QueryExecutor = configure(PlatformName.BPMSoft);
    const query: SelectQuery = new SelectQuery('Contact');
    query.addColumn('Name');
    query.enablePrimaryColumnFilter(recordId);

    executor.executeQuery(query).subscribe({ error: () => undefined });

    expect(clientType('select')).toBeNull();
  });

  it('does not mark queries to a platform that has no such check', () => {
    const executor: QueryExecutor = configure(PlatformName.Terrasoft);

    executor.executeQuery(targetedDelete()).subscribe({ error: () => undefined });

    expect(clientType('delete')).toBeNull();
  });

  it('does not mark anything when the platform is unknown', () => {
    const executor: QueryExecutor = configure(null);

    executor.executeQuery(targetedDelete()).subscribe({ error: () => undefined });

    expect(clientType('delete')).toBeNull();
  });
});
