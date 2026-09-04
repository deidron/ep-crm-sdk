import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { ALL_SCHEMA_OPERATION_RIGHTS, SchemaOperationRightLevel } from '@ep-crm/core';
import { QueryExecutor } from '../query-executor';
import { RightsService } from './rights';

function rightLevel(level: number) {
  return of({ GetSchemaOperationRightLevelResult: level });
}

function firstValue<T>(source: Observable<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => source.subscribe({ next: resolve, error: reject }));
}

describe('RightsService', () => {
  let rights: RightsService;
  let executeQuery: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    executeQuery = vi.fn();
    TestBed.configureTestingModule({
      providers: [{ provide: QueryExecutor, useValue: { executeQuery } }],
    });
    rights = TestBed.inject(RightsService);
  });

  afterEach(() => TestBed.resetTestingModule());

  it('splits the bit mask into individual rights', async () => {
    executeQuery.mockReturnValue(
      rightLevel(SchemaOperationRightLevel.CAN_READ | SchemaOperationRightLevel.CAN_EDIT),
    );
    await expect(firstValue(rights.getEntityRights('Contact'))).resolves.toEqual({
      canRead: true,
      canAppend: false,
      canEdit: true,
      canDelete: false,
    });
  });

  it('asks the server once per object', async () => {
    executeQuery.mockReturnValue(rightLevel(SchemaOperationRightLevel.CAN_READ));
    await firstValue(rights.canRead('Contact'));
    await firstValue(rights.canEdit('Contact'));
    expect(executeQuery).toHaveBeenCalledTimes(1);
  });

  it('treats the rights as full when the check fails', async () => {
    executeQuery.mockReturnValue(throwError(() => new Error('the service is unavailable')));
    await expect(firstValue(rights.getSchemaOperationRightLevel('Contact'))).resolves.toBe(
      ALL_SCHEMA_OPERATION_RIGHTS,
    );
  });

  it('asks the server again after the cache is cleared', async () => {
    executeQuery.mockReturnValue(rightLevel(SchemaOperationRightLevel.CAN_READ));
    await expect(firstValue(rights.canDelete('Contact'))).resolves.toBe(false);

    rights.clearCache();
    executeQuery.mockReturnValue(rightLevel(ALL_SCHEMA_OPERATION_RIGHTS));
    await expect(firstValue(rights.canDelete('Contact'))).resolves.toBe(true);
    expect(executeQuery).toHaveBeenCalledTimes(2);
  });
});
