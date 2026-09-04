import { formatDate, Location } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  InputSignal,
  linkedSignal,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { catchError, map, Observable, of } from 'rxjs';
import {
  BaseQueryResponse,
  DataValueType,
  Entity,
  EntityColumnValue,
  EntityRights,
  EntitySchema,
  EntitySchemaColumn,
  getLocalizedString,
  getLookupDisplayValue,
  getSchemaColumns,
  ParameterValueType,
  SelectQuery,
  UpdateQuery,
} from '@ep-crm/core';
import { CultureDateService, translatedText } from '@app/formatting';
import {
  EntityDataService,
  EntitySchemaManager,
  QueryExecutor,
  RightsService,
  UserContextService,
} from '@ep-crm/devkit';

const notDisplayableTypes: ReadonlySet<DataValueType> = new Set([
  DataValueType.BLOB,
  DataValueType.IMAGE,
  DataValueType.IMAGELOOKUP,
  DataValueType.FILE,
  DataValueType.FILE_LOCATOR,
  DataValueType.COLLECTION,
  DataValueType.ENTITY,
  DataValueType.ENTITY_COLLECTION,
  DataValueType.ENTITY_COLUMN_MAPPING_COLLECTION,
  DataValueType.MAPPING,
  DataValueType.OBJECT_LIST,
  DataValueType.COMPOSITE_OBJECT_LIST,
  DataValueType.HASH_TEXT,
  DataValueType.SECURE_TEXT,
]);

const ownColumnUsageType: number = 0;

type EditorType = 'text' | 'textarea' | 'number' | 'date' | 'datetime' | 'boolean';

const editorTypes: ReadonlyMap<DataValueType, EditorType> = new Map<DataValueType, EditorType>([
  [DataValueType.TEXT, 'text'],
  [DataValueType.SHORT_TEXT, 'text'],
  [DataValueType.MEDIUM_TEXT, 'text'],
  [DataValueType.LONG_TEXT, 'textarea'],
  [DataValueType.MAXSIZE_TEXT, 'textarea'],
  [DataValueType.INTEGER, 'number'],
  [DataValueType.FLOAT, 'number'],
  [DataValueType.MONEY, 'number'],
  [DataValueType.FLOAT1, 'number'],
  [DataValueType.FLOAT2, 'number'],
  [DataValueType.FLOAT3, 'number'],
  [DataValueType.FLOAT4, 'number'],
  [DataValueType.FLOAT8, 'number'],
  [DataValueType.DATE, 'date'],
  [DataValueType.DATE_TIME, 'datetime'],
  [DataValueType.BOOLEAN, 'boolean'],
]);

const noRights: EntityRights = {
  canRead: false,
  canAppend: false,
  canEdit: false,
  canDelete: false,
};

interface RecordField {
  name: string;
  caption: string;
  value: string;
  dataValueType: DataValueType;

  editor: EditorType | null;
  isRequired: boolean;
}

@Component({
  selector: 'app-entity-schema-page',
  imports: [TranslatePipe],
  templateUrl: './entity-schema-page.html',
  styleUrl: './entity-schema-page.css',
})
export class EntitySchemaPage {
  private readonly location = inject(Location);
  private readonly schemaManager = inject(EntitySchemaManager);
  private readonly data = inject(EntityDataService);
  private readonly executor = inject(QueryExecutor);
  private readonly rights = inject(RightsService);
  private readonly userContext = inject(UserContextService);
  private readonly translate = inject(TranslateService);
  private readonly dates = inject(CultureDateService);
  private readonly destroyRef = inject(DestroyRef);

  readonly schemaName: InputSignal<string | undefined> = input<string>();

  readonly id: InputSignal<string | undefined> = input<string>();

  private readonly schemaResource = rxResource({
    params: () => this.schemaName(),
    stream: ({ params }) => this.loadSchema(params),
    defaultValue: null as EntitySchema | null,
  });

  private readonly rightsResource = rxResource({
    params: () => this.schemaName(),
    stream: ({ params }) => (params ? this.rights.getEntityRights(params) : of(noRights)),
    defaultValue: noRights,
  });

  private readonly columns: Signal<EntitySchemaColumn[]> = computed(() =>
    getSchemaColumns(this.schemaResource.value()).filter(
      (column) =>
        column.usageType === ownColumnUsageType && !notDisplayableTypes.has(column.dataValueType),
    ),
  );

  private readonly recordResource = rxResource({
    params: () => ({ schemaName: this.schemaName(), id: this.id(), columns: this.columns() }),
    stream: ({ params }) => this.loadRecord(params.schemaName, params.id, params.columns),
    defaultValue: null as Entity | null,
  });

  readonly caption: Signal<string> = computed(() => {
    const schema: EntitySchema | null = this.schemaResource.value();
    return schema ? getLocalizedString(schema.caption, this.culture()) : (this.schemaName() ?? '');
  });

  readonly fields: Signal<RecordField[]> = computed(() => {
    const record: Entity | null = this.recordResource.value();
    if (!record) {
      return [];
    }
    return this.columns().map((column) => ({
      name: column.name,
      caption: getLocalizedString(column.caption, this.culture()),
      value: this.format(record[column.name], column.dataValueType),
      dataValueType: column.dataValueType,
      editor: this.editorOf(column),
      isRequired: column.isRequired,
    }));
  });

  readonly loading: Signal<boolean> = computed(
    () => this.schemaResource.isLoading() || this.recordResource.isLoading(),
  );

  readonly notFound: Signal<boolean> = computed(
    () => !this.loading() && this.recordResource.value() === null && this.columns().length > 0,
  );

  readonly schemaUnavailable: Signal<boolean> = computed(
    () => !this.loading() && this.schemaResource.value() === null,
  );

  readonly canEdit: Signal<boolean> = computed(
    () =>
      this.rightsResource.value().canEdit &&
      this.recordResource.value() !== null &&
      this.fields().some((field) => field.editor !== null),
  );

  readonly editing: WritableSignal<boolean> = linkedSignal({
    source: () => `${this.schemaName() ?? ''}/${this.id() ?? ''}`,
    computation: () => false,
  });

  readonly saving: WritableSignal<boolean> = signal(false);

  readonly saveError: WritableSignal<string | null> = signal<string | null>(null);

  private readonly draftState: WritableSignal<Record<string, string>> = linkedSignal(() =>
    this.initialDraft(),
  );

  readonly draft: Signal<Record<string, string>> = this.draftState.asReadonly();

  readonly dirty: Signal<boolean> = computed(() => this.changedFields().length > 0);

  readonly incomplete: Signal<boolean> = computed(() =>
    this.fields().some(
      (field) =>
        field.editor !== null &&
        field.editor !== 'boolean' &&
        field.isRequired &&
        !this.draftState()[field.name],
    ),
  );

  onEdit(): void {
    this.saveError.set(null);
    this.editing.set(true);
  }

  onCancel(): void {
    this.draftState.set(this.initialDraft());
    this.saveError.set(null);
    this.editing.set(false);
  }

  onFieldInput(name: string, event: Event): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    const value: string =
      target instanceof HTMLInputElement && target.type === 'checkbox'
        ? String(target.checked)
        : target.value;
    this.draftState.update((draft) => ({ ...draft, [name]: value }));
  }

  onSave(): void {
    const schemaName: string | undefined = this.schemaName();
    const id: string | undefined = this.id();
    const changed: RecordField[] = this.changedFields();
    if (!schemaName || !id || changed.length === 0) {
      this.editing.set(false);
      return;
    }
    const query: UpdateQuery = new UpdateQuery(schemaName);
    changed.forEach((field) =>
      query.setParameterValue(
        field.name,
        this.toParameterValue(this.draftState()[field.name], field.editor),
        field.dataValueType,
      ),
    );

    query.enablePrimaryColumnFilter(id);

    this.saving.set(true);
    this.saveError.set(null);
    this.executor
      .executeQuery<BaseQueryResponse>(query)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.editing.set(false);

          this.recordResource.reload();
        },
        error: (error: unknown) => {
          this.saving.set(false);
          this.saveError.set(
            error instanceof Error
              ? error.message
              : translatedText(this.translate, 'recordSaveFailed'),
          );
        },
      });
  }

  onClose(): void {
    this.location.back();
  }

  private readonly culture: Signal<string> = this.userContext.currentCulture;

  private readonly initialDraft: Signal<Record<string, string>> = computed(() => {
    const record: Entity | null = this.recordResource.value();
    if (!record) {
      return {};
    }
    const draft: Record<string, string> = {};
    this.columns().forEach((column) => {
      draft[column.name] = this.toInputValue(record[column.name], this.editorOf(column));
    });
    return draft;
  });

  private readonly changedFields: Signal<RecordField[]> = computed(() => {
    const initial: Record<string, string> = this.initialDraft();
    const draft: Record<string, string> = this.draftState();
    return this.fields().filter(
      (field) => field.editor !== null && draft[field.name] !== initial[field.name],
    );
  });

  private editorOf(column: EntitySchemaColumn): EditorType | null {
    if (column.isVirtual) {
      return null;
    }
    const editor: EditorType | undefined = editorTypes.get(column.dataValueType);
    if (editor === 'text' && column.isMultilineText) {
      return 'textarea';
    }
    return editor ?? null;
  }

  private toInputValue(value: EntityColumnValue, editor: EditorType | null): string {
    if (editor === 'boolean') {
      return String(value === true);
    }
    if (value === null || value === undefined) {
      return '';
    }
    if (value instanceof Date) {
      return formatDate(value, editor === 'date' ? 'yyyy-MM-dd' : "yyyy-MM-dd'T'HH:mm", 'en-US');
    }
    return typeof value === 'object' ? '' : String(value);
  }

  private toParameterValue(raw: string, editor: EditorType | null): ParameterValueType {
    if (editor === 'boolean') {
      return raw === 'true';
    }
    if (!raw) {
      return null;
    }
    if (editor === 'number') {
      const value: number = Number(raw);
      return Number.isFinite(value) ? value : null;
    }
    if (editor === 'date' || editor === 'datetime') {
      const value: Date = new Date(raw);
      return Number.isNaN(value.getTime()) ? null : value;
    }
    return raw;
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

  private loadRecord(
    schemaName: string | undefined,
    id: string | undefined,
    columns: EntitySchemaColumn[],
  ): Observable<Entity | null> {
    if (!schemaName || !id || columns.length === 0) {
      return of(null);
    }
    const query: SelectQuery = new SelectQuery(schemaName);
    columns.forEach((column) => query.addColumn(column.name, column.name));
    query.enablePrimaryColumnFilter(id);
    query.rowCount = 1;
    return this.data.selectFirst(query).pipe(catchError(() => of(null)));
  }

  private format(value: EntityColumnValue, dataValueType: DataValueType): string {
    if (dataValueType === DataValueType.LOOKUP) {
      return getLookupDisplayValue(value);
    }
    if (value instanceof Date) {
      return this.dates.render(value, dataValueType !== DataValueType.DATE);
    }
    if (typeof value === 'boolean') {
      return translatedText(this.translate, value ? 'commonYes' : 'commonNo');
    }
    return value === null || typeof value === 'object' ? '' : String(value);
  }
}
