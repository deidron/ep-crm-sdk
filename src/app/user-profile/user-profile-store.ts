import { computed, inject, Service, Signal, signal, WritableSignal } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import {
  AggregationEvalType,
  AggregationFunctionColumn,
  AggregationType,
  BatchQuery,
  ColumnExpression,
  ComparisonType,
  Entity,
  FilterUtils,
  OrderDirection,
  SelectQuery,
  SelectQueryResponse,
} from '@ep-crm/core';
import { BatchQueryFactory, QueryExecutor, UserContextService } from '@ep-crm/devkit';
import { UserProfileData } from '@app/user-profile/user-profile-data.model';

const recentActivityCount: number = 10;

@Service()
export class UserProfileStore {
  private readonly executor = inject(QueryExecutor);
  private readonly userContext = inject(UserContextService);
  private readonly batches = inject(BatchQueryFactory);

  private readonly openedState: WritableSignal<boolean> = signal(false);

  readonly opened: Signal<boolean> = this.openedState.asReadonly();

  readonly contactId: Signal<string | null> = computed(
    () => this.userContext.userInfo()?.contactId ?? null,
  );

  open(): void {
    this.openedState.set(true);
  }

  close(): void {
    this.openedState.set(false);
  }

  load(): Observable<UserProfileData> {
    const contactId: string | null = this.contactId();
    if (!contactId) {
      return of({ contact: null, activityCount: 0, recentActivities: [] });
    }

    const batch: BatchQuery = this.batches.create();
    batch.addNamed('contact', this.contactQuery(contactId));
    batch.addNamed('activityCount', this.activityCountQuery(contactId));
    batch.addNamed('recentActivities', this.recentActivityQuery(contactId));

    return this.executor.executeQuery(batch).pipe(
      map(() => ({
        contact: this.rows(batch, 'contact')[0] ?? null,
        activityCount: Number(this.rows(batch, 'activityCount')[0]?.['ActivityCount'] ?? 0),
        recentActivities: this.rows(batch, 'recentActivities'),
      })),
    );
  }

  private rows(batch: BatchQuery, name: string): Entity[] {
    return batch.getResult<SelectQueryResponse>(name)?.rows ?? [];
  }

  private contactQuery(contactId: string): SelectQuery {
    const query: SelectQuery = new SelectQuery('Contact');
    ['Name', 'Email', 'MobilePhone', 'Account', 'BirthDate', 'CreatedOn'].forEach((column) =>
      query.addColumn(column, column),
    );
    query.enablePrimaryColumnFilter(contactId);
    query.rowCount = 1;
    return query;
  }

  private activityCountQuery(contactId: string): SelectQuery {
    const query: SelectQuery = new SelectQuery('Activity');
    query.addQueryColumn(
      new AggregationFunctionColumn(
        AggregationType.COUNT,
        AggregationEvalType.ALL,
        new ColumnExpression('Id'),
      ),
      'ActivityCount',
    );
    query.addFilter(
      'ownerFilter',
      FilterUtils.createColumnFilterWithParameter(ComparisonType.EQUAL, 'Owner', contactId),
    );
    return query;
  }

  private recentActivityQuery(contactId: string): SelectQuery {
    const query: SelectQuery = new SelectQuery('Activity');
    ['Title', 'StartDate', 'Status'].forEach((column) => query.addColumn(column, column));
    query.columns.collection.get('StartDate')?.withOrdering(OrderDirection.DESC, 0);
    query.addFilter(
      'ownerFilter',
      FilterUtils.createColumnFilterWithParameter(ComparisonType.EQUAL, 'Owner', contactId),
    );
    query.rowCount = recentActivityCount;
    return query;
  }
}
