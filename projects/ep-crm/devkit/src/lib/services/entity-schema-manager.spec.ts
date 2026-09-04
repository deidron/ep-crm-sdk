import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { ArgumentException, BaseSchemaManagerItem, EntitySchemaRequest } from '@ep-crm/core';
import { QueryExecutor } from '../query-executor';
import { EntitySchemaManager } from './entity-schema-manager';

function schemaItem(name: string, extendParent = false): BaseSchemaManagerItem {
  return {
    uId: `uid-${name}`,
    packageUId: `pkg-${name}`,
    name,
    caption: name,
    parentUId: '',
    extendParent,
  } as BaseSchemaManagerItem;
}

describe('EntitySchemaManager', () => {
  let manager: EntitySchemaManager;
  let executeQuery: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    executeQuery = vi.fn();
    TestBed.configureTestingModule({
      providers: [{ provide: QueryExecutor, useValue: { executeQuery } }],
    });
    manager = TestBed.inject(EntitySchemaManager);
  });

  afterEach(() => TestBed.resetTestingModule());

  describe('init', () => {
    it('remembers the object list', async () => {
      executeQuery.mockReturnValue(of({ collection: [schemaItem('Contact')] }));
      await expect(firstValue(manager.init())).resolves.toBe(true);
      expect(manager.items).toHaveLength(1);
    });

    it('returns false for an empty list', async () => {
      executeQuery.mockReturnValue(of({ collection: [] }));
      await expect(firstValue(manager.init())).resolves.toBe(false);
    });

    it('does not break route resolution when the service fails', async () => {
      executeQuery.mockReturnValue(throwError(() => new Error('the service is unavailable')));
      await expect(firstValue(manager.init())).resolves.toBe(false);
    });
  });

  describe('getEntitySchema', () => {
    beforeEach(async () => {
      executeQuery.mockReturnValue(
        of({ collection: [schemaItem('Contact'), schemaItem('Extension', true)] }),
      );
      await firstValue(manager.init());
      executeQuery.mockClear();
    });

    it('passes the uId and packageUId of the found object', async () => {
      executeQuery.mockReturnValue(of({ schema: { name: 'Contact' } }));
      await firstValue(manager.getEntitySchema('Contact'));
      const request = executeQuery.mock.calls[0][0] as EntitySchemaRequest;
      expect(request.uId).toBe('uid-Contact');
      expect(request.packageUId).toBe('pkg-Contact');
    });

    it('rejects an unknown name without calling the service', async () => {
      await expect(firstValue(manager.getEntitySchema('NoSuchObject'))).rejects.toBeInstanceOf(
        ArgumentException,
      );
      expect(executeQuery).not.toHaveBeenCalled();
    });

    it('skips extension objects while searching', () => {
      expect(manager.findItemByName('Extension')).toBeNull();
    });

    it('asks for a schema once per object', async () => {
      executeQuery.mockReturnValue(of({ schema: { name: 'Contact' } }));
      await firstValue(manager.getEntitySchema('Contact'));
      await firstValue(manager.getEntitySchema('Contact'));
      expect(executeQuery).toHaveBeenCalledTimes(1);
    });

    it('asks for the schema again after the cache is cleared', async () => {
      executeQuery.mockReturnValue(of({ schema: { name: 'Contact' } }));
      await firstValue(manager.getEntitySchema('Contact'));
      manager.clearCache();
      expect(manager.items).toBeUndefined();
      expect(manager.findItemByName('Contact')).toBeNull();
    });
  });
});

function firstValue<T>(source: Observable<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    source.subscribe({ next: resolve, error: reject });
  });
}
