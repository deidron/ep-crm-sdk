import { inject, Service } from '@angular/core';
import { catchError, map, Observable, of, shareReplay, throwError } from 'rxjs';
import { QueryExecutor } from '../query-executor';
import { ArgumentException } from '@ep-crm/core';
import { BaseSchemaManagerItem } from '@ep-crm/core';
import { EntitySchemaResponse } from '@ep-crm/core';
import { EntitySchemaManagerRequest } from '@ep-crm/core';
import { EntitySchemaRequest } from '@ep-crm/core';

function getItemName(item: BaseSchemaManagerItem): string {
  return item.name;
}

@Service()
export class EntitySchemaManager {
  private readonly executor = inject(QueryExecutor);

  items?: BaseSchemaManagerItem[];

  private readonly schemas: Map<string, Observable<EntitySchemaResponse>> = new Map<
    string,
    Observable<EntitySchemaResponse>
  >();

  init(): Observable<boolean> {
    return this.executor.executeQuery(new EntitySchemaManagerRequest()).pipe(
      map((request) => {
        this.items = request.collection;
        return this.items?.length > 0;
      }),

      catchError(() => of(false)),
    );
  }

  getEntitySchema(name: string): Observable<EntitySchemaResponse> {
    const cached: Observable<EntitySchemaResponse> | undefined = this.schemas.get(name);
    if (cached) {
      return cached;
    }
    const schema: BaseSchemaManagerItem | null = this.findItemByName(name);
    if (!schema) {
      return throwError(
        () =>
          new ArgumentException(
            'name',
            `The "${name}" object was not found in the schema manager list.`,
          ),
      );
    }
    const request: EntitySchemaRequest = new EntitySchemaRequest();
    request.uId = schema.uId;
    request.packageUId = schema.packageUId;
    const schema$: Observable<EntitySchemaResponse> = this.executor
      .executeQuery(request)
      .pipe(shareReplay({ bufferSize: 1, refCount: false }));
    this.schemas.set(name, schema$);
    return schema$;
  }

  clearCache(): void {
    this.items = undefined;
    this.schemas.clear();
  }

  findItemByName(name: string): BaseSchemaManagerItem | null {
    return this.findItemByValue(name, getItemName);
  }

  private findItemByValue(
    value: string,
    predicate: (response: BaseSchemaManagerItem) => string,
  ): BaseSchemaManagerItem | null {
    const filteredCollection = this.items?.filter(
      (item) => !item.extendParent && predicate(item) === value,
    );
    return filteredCollection?.[0] ?? null;
  }
}
