import {
  Component,
  computed,
  inject,
  input,
  InputSignal,
  linkedSignal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { catchError, map, Observable, of } from 'rxjs';
import {
  ComparisonType,
  DataValueType,
  Entity,
  EntitySchema,
  EntitySchemaColumn,
  FilterUtils,
  findSchemaColumn,
  getLocalizedString,
  MacrosFunctionColumn,
  OrderDirection,
  QueryMacrosType,
  SelectQuery,
} from '@ep-crm/core';
import { EntityDataService, EntitySchemaManager, UserContextService } from '@ep-crm/devkit';
import {
  CultureDateService,
  DateRenderMode,
  dateRenderMode,
  translatedText,
} from '@app/formatting';

const columnNames: readonly string[] = ['Id', 'CreatedOn', 'ModifiedOn'];

const displayColumnAlias: string = 'PrimaryDisplayValue';

const pageSize: number = 10;

interface SectionColumn {
  name: string;
  caption: string;
  dateMode: DateRenderMode | null;
}

@Component({
  selector: 'app-entity-schema-section',
  imports: [TranslatePipe],
  templateUrl: './entity-schema-section.html',
  styleUrl: './entity-schema-section.css',
})
export class EntitySchemaSection {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly data = inject(EntityDataService);
  private readonly schemaManager = inject(EntitySchemaManager);
  private readonly userContext = inject(UserContextService);
  private readonly translate = inject(TranslateService);
  private readonly dates = inject(CultureDateService);

  readonly schemaName: InputSignal<string | undefined> = input<string>();

  readonly pageSize: number = pageSize;

  readonly searchTerm: WritableSignal<string> = linkedSignal({
    source: () => this.schemaName(),
    computation: () => '',
  });

  readonly search: WritableSignal<string> = linkedSignal({
    source: () => this.schemaName(),
    computation: () => '',
  });

  private readonly page = linkedSignal({
    source: () => `${this.schemaName() ?? ''}/${this.search()}`,
    computation: () => 0,
  });

  private readonly schemaResource = rxResource({
    params: () => this.schemaName(),
    stream: ({ params }) => this.loadSchema(params),
    defaultValue: null as EntitySchema | null,
  });

  private readonly pageResource = rxResource({
    params: () => ({ schemaName: this.schemaName(), page: this.page(), search: this.search() }),
    stream: ({ params }) => this.loadPage(params.schemaName, params.page, params.search),
    defaultValue: [] as Entity[],
  });

  readonly caption: Signal<string> = computed(() => {
    const schema: EntitySchema | null = this.schemaResource.value();
    return schema
      ? getLocalizedString(schema.caption, this.userContext.currentCulture())
      : (this.schemaName() ?? '');
  });

  readonly columns: Signal<SectionColumn[]> = computed(() => {
    const schema: EntitySchema | null = this.schemaResource.value();
    const culture: string = this.userContext.currentCulture();
    const columns: SectionColumn[] = columnNames.map((name) => {
      const column: EntitySchemaColumn | null = findSchemaColumn(schema, name);
      return {
        name,
        caption: column ? getLocalizedString(column.caption, culture) : name,
        dateMode: column ? dateRenderMode(column.dataValueType) : null,
      };
    });

    return [
      {
        name: displayColumnAlias,
        caption: translatedText(this.translate, 'sectionDisplayColumn'),
        dateMode: null,
      },
      ...columns,
    ];
  });

  readonly rows: Signal<Entity[]> = computed(() => this.pageResource.value().slice(0, pageSize));

  readonly loading: Signal<boolean> = this.pageResource.isLoading;

  readonly errorMessage: Signal<string | null> = computed(() => {
    const error: unknown = this.pageResource.error();
    return error instanceof Error ? error.message : null;
  });

  readonly hasNextPage: Signal<boolean> = computed(
    () => this.pageResource.value().length > pageSize,
  );

  readonly hasPreviousPage: Signal<boolean> = computed(() => this.page() > 0);

  readonly rangeFrom: Signal<number> = computed(() =>
    this.rows().length ? this.page() * pageSize + 1 : 0,
  );

  readonly rangeTo: Signal<number> = computed(() => this.page() * pageSize + this.rows().length);

  nextPage(): void {
    if (this.hasNextPage()) {
      this.page.update((page) => page + 1);
    }
  }

  previousPage(): void {
    if (this.hasPreviousPage()) {
      this.page.update((page) => page - 1);
    }
  }

  onSearchInput(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  onSearchSubmit(): void {
    this.search.set(this.searchTerm().trim());
  }

  onSearchClear(): void {
    this.searchTerm.set('');
    this.search.set('');
  }

  openPage(row: Entity): void {
    const id: unknown = row['Id'];
    if (typeof id !== 'string') {
      return;
    }
    void this.router.navigate(['edit', id], { relativeTo: this.route });
  }

  renderDate(value: unknown, mode: DateRenderMode): string {
    return this.dates.render(value, mode);
  }

  private loadSchema(schemaName: string | undefined): Observable<EntitySchema | null> {
    if (!schemaName) {
      return of(null);
    }
    return this.schemaManager.getEntitySchema(schemaName).pipe(
      map((response) => response.schema),

      catchError(() => of(null)),
    );
  }

  private loadPage(
    schemaName: string | undefined,
    page: number,
    search: string,
  ): Observable<Entity[]> {
    if (!schemaName) {
      return of([]);
    }
    const query: SelectQuery = new SelectQuery(schemaName);
    columnNames.forEach((column) => query.addColumn(column, column));
    query.addQueryColumn(
      new MacrosFunctionColumn(QueryMacrosType.PRIMARY_DISPLAY_COLUMN),
      displayColumnAlias,
    );
    query.columns.collection.get('CreatedOn')?.withOrdering(OrderDirection.DESC, 0);
    if (search) {
      query.addFilter(
        'searchFilter',
        FilterUtils.createPrimaryDisplayColumnFilterWithParameter(
          ComparisonType.START_WITH,
          search,
          DataValueType.TEXT,
        ),
      );
    }
    query.rowCount = pageSize + 1;
    query.rowsOffset = page * pageSize;

    query.isPageable = true;
    return this.data.select(query);
  }
}
