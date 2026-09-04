import { inject, Service } from '@angular/core';
import { catchError, map, Observable, of, shareReplay } from 'rxjs';
import { QueryExecutor } from '../query-executor';
import { SchemaOperationRightLevelRequest } from '@ep-crm/core';
import { ALL_SCHEMA_OPERATION_RIGHTS, SchemaOperationRightLevel } from '@ep-crm/core';
import { EntityRights, SchemaOperationRightLevelResponse } from '@ep-crm/core';

@Service()
export class RightsService {
  private readonly executor = inject(QueryExecutor);

  static readonly defaultRightLevel: number = ALL_SCHEMA_OPERATION_RIGHTS;

  private readonly cache: Map<string, Observable<number>> = new Map<string, Observable<number>>();

  getSchemaOperationRightLevel(schemaName: string): Observable<number> {
    const cached: Observable<number> | undefined = this.cache.get(schemaName);
    if (cached) {
      return cached;
    }
    const rightLevel$: Observable<number> = this.executor
      .executeQuery<SchemaOperationRightLevelResponse>(
        new SchemaOperationRightLevelRequest(schemaName),
      )
      .pipe(
        map((response) => response.GetSchemaOperationRightLevelResult),
        catchError(() => of(RightsService.defaultRightLevel)),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    this.cache.set(schemaName, rightLevel$);
    return rightLevel$;
  }

  getEntityRights(schemaName: string): Observable<EntityRights> {
    return this.getSchemaOperationRightLevel(schemaName).pipe(
      map((rightLevel) => ({
        canRead: RightsService.hasRight(rightLevel, SchemaOperationRightLevel.CAN_READ),
        canAppend: RightsService.hasRight(rightLevel, SchemaOperationRightLevel.CAN_APPEND),
        canEdit: RightsService.hasRight(rightLevel, SchemaOperationRightLevel.CAN_EDIT),
        canDelete: RightsService.hasRight(rightLevel, SchemaOperationRightLevel.CAN_DELETE),
      })),
    );
  }

  canRead(schemaName: string): Observable<boolean> {
    return this.can(schemaName, SchemaOperationRightLevel.CAN_READ);
  }

  canAppend(schemaName: string): Observable<boolean> {
    return this.can(schemaName, SchemaOperationRightLevel.CAN_APPEND);
  }

  canEdit(schemaName: string): Observable<boolean> {
    return this.can(schemaName, SchemaOperationRightLevel.CAN_EDIT);
  }

  canDelete(schemaName: string): Observable<boolean> {
    return this.can(schemaName, SchemaOperationRightLevel.CAN_DELETE);
  }

  clearCache(): void {
    this.cache.clear();
  }

  private can(schemaName: string, right: SchemaOperationRightLevel): Observable<boolean> {
    return this.getSchemaOperationRightLevel(schemaName).pipe(
      map((rightLevel) => RightsService.hasRight(rightLevel, right)),
    );
  }

  private static hasRight(rightLevel: number, right: SchemaOperationRightLevel): boolean {
    const mask: number = right;
    return (rightLevel & mask) === mask;
  }
}
