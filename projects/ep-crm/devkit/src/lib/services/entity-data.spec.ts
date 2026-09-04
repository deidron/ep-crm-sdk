import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { DataValueType, Entity, SelectQuery } from '@ep-crm/core';
import { QueryExecutor } from '../query-executor';
import { EntityDataService } from './entity-data';

function selectResponse(rows: Entity[]) {
  return of({
    rowConfig: { CreatedOn: { dataValueType: DataValueType.DATE_TIME } },
    rows,
    notFoundColumns: [],
    rowsAffected: rows.length,
    nextPrcElReady: false,
    success: true,
  });
}

function firstValue<T>(source: Observable<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => source.subscribe({ next: resolve, error: reject }));
}

describe('EntityDataService', () => {
  let data: EntityDataService;
  let executeQuery: ReturnType<typeof vi.fn>;
  let query: SelectQuery;

  beforeEach(() => {
    executeQuery = vi.fn();
    TestBed.configureTestingModule({
      providers: [{ provide: QueryExecutor, useValue: { executeQuery } }],
    });
    data = TestBed.inject(EntityDataService);
    query = new SelectQuery('Contact');
    query.addColumn('Id');
  });

  afterEach(() => TestBed.resetTestingModule());

  describe('select', () => {
    it('returns the rows without the response wrapper and without a cast', async () => {
      const rows: Entity[] = [{ Id: '1', CreatedOn: new Date(2020, 0, 1) }, { Id: '2' }];
      executeQuery.mockReturnValue(selectResponse(rows));
      await expect(firstValue(data.select(query))).resolves.toEqual(rows);
    });

    it('passes the query to the executor as is', async () => {
      executeQuery.mockReturnValue(selectResponse([]));
      await firstValue(data.select(query));
      expect(executeQuery).toHaveBeenCalledWith(query);
    });

    it('lets a failure through to the outside', async () => {
      executeQuery.mockReturnValue(throwError(() => new Error('the service is unavailable')));
      await expect(firstValue(data.select(query))).rejects.toThrow('the service is unavailable');
    });
  });

  describe('selectFirst', () => {
    it('returns the first row', async () => {
      executeQuery.mockReturnValue(selectResponse([{ Id: '1' }, { Id: '2' }]));
      await expect(firstValue(data.selectFirst(query))).resolves.toEqual({ Id: '1' });
    });

    it('returns null when there are no records', async () => {
      executeQuery.mockReturnValue(selectResponse([]));
      await expect(firstValue(data.selectFirst(query))).resolves.toBeNull();
    });
  });
});
