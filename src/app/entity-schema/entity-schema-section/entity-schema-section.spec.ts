import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import {
  ComparisonType,
  DataValueType,
  Entity,
  EntitySchema,
  QueryMacrosType,
  SelectQuery,
} from '@ep-crm/core';
import { EntityDataService, EntitySchemaManager, UserContextService } from '@ep-crm/devkit';
import { EntitySchemaSection } from './entity-schema-section';
import { translationProviders, useRussianTranslations } from '@app/testing/translate.testing';

const schema: EntitySchema = {
  uId: 'schema-uid',
  name: 'Contact',
  caption: { 'ru-RU': 'Контакт', 'en-US': 'Contact' },
  columns: {
    Items: {
      id: {
        uId: 'id',
        name: 'Id',
        caption: { 'en-US': 'Id' },
        dataValueType: DataValueType.GUID,
      },
      createdOn: {
        uId: 'createdOn',
        name: 'CreatedOn',
        caption: { 'ru-RU': 'Дата создания', 'en-US': 'Created on' },
        dataValueType: DataValueType.DATE_TIME,
      },
    },
  },
} as unknown as EntitySchema;

const createdOn: Date = new Date(2026, 1, 1, 13, 45, 30);

function rows(count: number): Entity[] {
  return Array.from({ length: count }, (_, index) => ({
    Id: `r${index}`,
    PrimaryDisplayValue: `Record ${index}`,
    CreatedOn: createdOn,
  }));
}

interface Setup {
  fixture: ComponentFixture<EntitySchemaSection>;

  sent: SelectQuery[];
}

function configure(available: Entity[]): Setup {
  const sent: SelectQuery[] = [];

  TestBed.configureTestingModule({
    imports: [EntitySchemaSection],
    providers: [
      ...translationProviders,
      { provide: Router, useValue: { navigate: vi.fn() } },
      { provide: ActivatedRoute, useValue: {} },
      { provide: EntitySchemaManager, useValue: { getEntitySchema: () => of({ schema }) } },
      {
        provide: EntityDataService,
        useValue: {
          select: (query: SelectQuery) => {
            sent.push(query);
            return of(available);
          },
        },
      },
      {
        provide: UserContextService,
        useValue: {
          currentCulture: signal('ru-RU'),
          userInfo: signal({
            cultureInfo: {
              dateTimeFormat: { shortDatePattern: 'yyyy-MM-dd', shortTimePattern: 'HH:mm' },
            },
          }),
        },
      },
    ],
  });

  useRussianTranslations();
  const fixture: ComponentFixture<EntitySchemaSection> =
    TestBed.createComponent(EntitySchemaSection);
  fixture.componentRef.setInput('schemaName', 'Contact');
  return { fixture, sent };
}

async function open(fixture: ComponentFixture<EntitySchemaSection>): Promise<void> {
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
}

function button(
  fixture: ComponentFixture<EntitySchemaSection>,
  caption: string,
): HTMLButtonElement {
  return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button')).find(
    (element) => (element.textContent ?? '').includes(caption),
  )!;
}

async function search(fixture: ComponentFixture<EntitySchemaSection>, term: string): Promise<void> {
  const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
    'input[type="search"]',
  )!;
  input.value = term;
  input.dispatchEvent(new Event('input'));
  fixture.detectChanges();

  button(fixture, 'Найти').click();
  await fixture.whenStable();
  fixture.detectChanges();
}

function serialized(query: SelectQuery): Record<string, Record<string, unknown>> {
  return JSON.parse(query.serialize());
}

function searchFilter(query: SelectQuery): Record<string, unknown> | undefined {
  return (serialized(query)['filters']['items'] as Record<string, Record<string, unknown>>)[
    'searchFilter'
  ];
}

describe('EntitySchemaSection', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('shows the record display value as a separate column', async () => {
    const { fixture, sent } = configure(rows(3));

    await open(fixture);

    const text: string = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Название');
    expect(text).toContain('Record 0');

    const columns = serialized(sent[0])['columns'] as unknown as {
      items: Record<string, { expression: { macrosType: number } }>;
    };
    expect(columns.items['PrimaryDisplayValue'].expression.macrosType).toBe(
      QueryMacrosType.PRIMARY_DISPLAY_COLUMN,
    );
  });

  it('takes the section title from the schema in the user language', async () => {
    const { fixture } = configure(rows(3));

    await open(fixture);

    expect((fixture.nativeElement as HTMLElement).querySelector('h1')!.textContent!.trim()).toBe(
      'Контакт',
    );
  });

  it('sends the select without a search filter when there is no query', async () => {
    const { fixture, sent } = configure(rows(3));

    await open(fixture);

    expect(searchFilter(sent[0])).toBeUndefined();
  });

  it('sends no request for text typed but not applied', async () => {
    const { fixture, sent } = configure(rows(3));
    await open(fixture);
    const before: number = sent.length;

    const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
      'input[type="search"]',
    )!;
    input.value = 'Joh';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(sent).toHaveLength(before);
  });

  it('filters by the display column through a macro', async () => {
    const { fixture, sent } = configure(rows(3));
    await open(fixture);

    await search(fixture, 'Joh');

    const filter = searchFilter(sent[sent.length - 1])!;
    expect(filter['comparisonType']).toBe(ComparisonType.START_WITH);
    expect(filter['leftExpression']).toMatchObject({
      macrosType: QueryMacrosType.PRIMARY_DISPLAY_COLUMN,
    });
    expect(filter['rightExpression']).toMatchObject({ parameter: { value: 'Joh' } });
  });

  it('returns to the first page on a new query', async () => {
    const { fixture, sent } = configure(rows(11));
    await open(fixture);

    button(fixture, 'Дальше').click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(serialized(sent[sent.length - 1])['rowsOffset']).toBe(10);

    await search(fixture, 'Joh');

    expect(serialized(sent[sent.length - 1])['rowsOffset']).toBe(0);
  });

  it('clears the search when moving to another section', async () => {
    const { fixture, sent } = configure(rows(3));
    await open(fixture);
    await search(fixture, 'Joh');

    fixture.componentRef.setInput('schemaName', 'Account');
    await fixture.whenStable();
    fixture.detectChanges();

    const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
      'input[type="search"]',
    )!;
    expect(input.value).toBe('');

    expect(searchFilter(sent[sent.length - 1])).toBeUndefined();
  });

  it('tells an empty search result apart from an empty section', async () => {
    const { fixture } = configure([]);
    await open(fixture);

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Записей нет');

    await search(fixture, 'Joh');

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Ничего не найдено');
  });

  it('drops the filter when cleared', async () => {
    const { fixture, sent } = configure(rows(3));
    await open(fixture);
    await search(fixture, 'Joh');

    button(fixture, 'Очистить').click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(searchFilter(sent[sent.length - 1])).toBeUndefined();
  });

  it('shows dates in the format of the user culture', async () => {
    const { fixture } = configure(rows(1));
    await open(fixture);

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('2026-02-01 13:45');
    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('01.02.2026');
  });
});
