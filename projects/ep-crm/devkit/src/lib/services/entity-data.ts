import { inject, Service } from '@angular/core';
import { map, Observable } from 'rxjs';
import { QueryExecutor } from '../query-executor';
import { Entity, SelectQuery, SelectQueryResponse } from '@ep-crm/core';

@Service()
export class EntityDataService {
  private readonly executor = inject(QueryExecutor);

  select(query: SelectQuery): Observable<Entity[]> {
    return this.executor
      .executeQuery<SelectQueryResponse>(query)
      .pipe(map((response) => response.rows));
  }

  selectFirst(query: SelectQuery): Observable<Entity | null> {
    return this.select(query).pipe(map((rows) => rows[0] ?? null));
  }
}
