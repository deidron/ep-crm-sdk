import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, concatMap, forkJoin, map, Observable, of } from 'rxjs';
import { EntitySchemaManager } from '@ep-crm/devkit';
import { EntitySchemaResponse } from '@ep-crm/core';

const schemaNames: readonly string[] = ['Activity', 'Contact', 'Account'];

export const entitySchemaResolver: ResolveFn<EntitySchemaResponse[]> = (): Observable<
  EntitySchemaResponse[]
> => {
  const entitySchemaManager: EntitySchemaManager = inject(EntitySchemaManager);
  return entitySchemaManager.init().pipe(
    concatMap((initialized) => {
      if (!initialized) {
        return of<EntitySchemaResponse[]>([]);
      }
      return forkJoin(
        schemaNames.map((schemaName) => loadSchema(entitySchemaManager, schemaName)),
      ).pipe(
        map((schemas) =>
          schemas.filter((schema): schema is EntitySchemaResponse => schema !== null),
        ),
      );
    }),
  );
};

function loadSchema(
  manager: EntitySchemaManager,
  schemaName: string,
): Observable<EntitySchemaResponse | null> {
  return manager.getEntitySchema(schemaName).pipe(
    catchError((error) => {
      console.error(`Failed to load the "${schemaName}" object:`, error);
      return of(null);
    }),
  );
}
