import { Location } from '@angular/common';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import {
  DataValueType,
  Entity,
  EntityRights,
  EntitySchema,
  EntitySchemaColumn,
  Query,
  UpdateQuery,
} from '@ep-crm/core';
import {
  EntityDataService,
  EntitySchemaManager,
  QueryExecutor,
  RightsService,
  UserContextService,
} from '@ep-crm/devkit';
import { EntitySchemaPage } from './entity-schema-page';
import { translationProviders, useRussianTranslations } from '@app/testing/translate.testing';

function column(
  name: string,
  dataValueType: DataValueType,
  extra: Partial<EntitySchemaColumn> = {},
): EntitySchemaColumn {
  return {
    uId: name,
    name,
    caption: { 'en-US': name },
    dataValueType,
    usageType: 0,
    isRequired: false,
    isVirtual: false,
    isMultilineText: false,
    ...extra,
  } as EntitySchemaColumn;
}

const schema: EntitySchema = {
  uId: 'schema-uid',
  name: 'Contact',
  caption: { 'en-US': 'Contact' },
  columns: {
    Items: {
      name: column('Name', DataValueType.TEXT),
      confirmed: column('Confirmed', DataValueType.BOOLEAN),
      owner: column('Owner', DataValueType.LOOKUP),
      from: column('From', DataValueType.TIME),
    },
  },
} as unknown as EntitySchema;

const record: Entity = {
  Name: 'John Smith',
  Confirmed: false,
  Owner: { value: 'o1', displayValue: 'Peter Brown' },
  From: new Date(2019, 6, 15, 8, 2),
};

const allRights: EntityRights = {
  canRead: true,
  canAppend: true,
  canEdit: true,
  canDelete: true,
};

const readOnlyRights: EntityRights = { ...allRights, canEdit: false };

interface Setup {
  fixture: ComponentFixture<EntitySchemaPage>;

  sent: Query<unknown>[];
  selectCount: () => number;
}

function configure(rights: EntityRights, saveFails: boolean = false): Setup {
  const sent: Query<unknown>[] = [];
  let selects: number = 0;

  TestBed.configureTestingModule({
    imports: [EntitySchemaPage],
    providers: [
      ...translationProviders,
      { provide: Location, useValue: { back: vi.fn() } },
      {
        provide: EntitySchemaManager,
        useValue: { getEntitySchema: () => of({ schema }) },
      },
      {
        provide: EntityDataService,
        useValue: {
          selectFirst: () => {
            selects += 1;
            return of(record);
          },
        },
      },
      {
        provide: QueryExecutor,
        useValue: {
          executeQuery: (query: Query<unknown>) => {
            sent.push(query);
            return saveFails
              ? throwError(() => new Error('The record is locked'))
              : of({ success: true, rowsAffected: 1 });
          },
        },
      },
      { provide: RightsService, useValue: { getEntityRights: () => of(rights) } },
      {
        provide: UserContextService,
        useValue: { currentCulture: signal('en-US'), userInfo: () => ({ cultureInfo: {} }) },
      },
    ],
  });

  useRussianTranslations();
  const fixture: ComponentFixture<EntitySchemaPage> = TestBed.createComponent(EntitySchemaPage);
  fixture.componentRef.setInput('schemaName', 'Contact');
  fixture.componentRef.setInput('id', 'r1');
  return { fixture, sent, selectCount: () => selects };
}

async function open(fixture: ComponentFixture<EntitySchemaPage>): Promise<void> {
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
}

function host(fixture: ComponentFixture<EntitySchemaPage>): HTMLElement {
  return fixture.nativeElement as HTMLElement;
}

function button(
  fixture: ComponentFixture<EntitySchemaPage>,
  caption: string,
): HTMLButtonElement | null {
  return (
    Array.from(host(fixture).querySelectorAll('button')).find((element) =>
      (element.textContent ?? '').includes(caption),
    ) ?? null
  );
}

function columnValues(query: Query<unknown>): Record<string, Record<string, unknown>> {
  return JSON.parse((query as UpdateQuery).serialize())['columnValues']['items'];
}

describe('EntitySchemaPage', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('shows no edit button without the edit right', async () => {
    const { fixture } = configure(readOnlyRights);

    await open(fixture);

    expect(host(fixture).textContent).toContain('John Smith');
    expect(button(fixture, 'Изменить')).toBeNull();
  });

  it('shows the edit button with the edit right', async () => {
    const { fixture } = configure(allRights);

    await open(fixture);

    expect(button(fixture, 'Изменить')).not.toBeNull();
  });

  it('keeps a lookup read-only in edit mode', async () => {
    const { fixture } = configure(allRights);
    await open(fixture);

    button(fixture, 'Изменить')!.click();
    fixture.detectChanges();

    expect(host(fixture).querySelector('input#field-Name')).not.toBeNull();
    expect(host(fixture).querySelector('input#field-Owner')).toBeNull();
    expect(host(fixture).querySelector('#field-Owner')!.textContent).toContain('Peter Brown');
  });

  it('shows a time column without the day it is stored with', async () => {
    const { fixture } = configure(allRights);

    await open(fixture);

    const text: string = host(fixture).textContent ?? '';
    expect(text).toContain('08:02');
    expect(text).not.toContain('2019');
  });

  it('sends the edited time of a time column', async () => {
    const { fixture, sent } = configure(allRights);
    await open(fixture);

    button(fixture, 'Изменить')!.click();
    fixture.detectChanges();

    const input = host(fixture).querySelector<HTMLInputElement>('input#field-From')!;
    expect(input.type).toBe('time');
    expect(input.value).toBe('08:02');

    input.value = '09:30';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    button(fixture, 'Сохранить')!.click();
    await fixture.whenStable();
    fixture.detectChanges();

    const values = columnValues(sent[0]);
    expect(Object.keys(values)).toEqual(['From']);
    // The day is whatever the platform would stamp on it anyway, so only the time is fixed.
    expect(values['From']['parameter']).toMatchObject({
      value: expect.stringMatching(/^"\d{4}-\d{2}-\d{2}T09:30:00\.000"$/) as unknown as string,
    });
  });

  it('sends only the touched columns in the update and re-reads the record', async () => {
    const { fixture, sent, selectCount } = configure(allRights);
    await open(fixture);
    const selectsBeforeSave: number = selectCount();

    button(fixture, 'Изменить')!.click();
    fixture.detectChanges();

    const input = host(fixture).querySelector<HTMLInputElement>('input#field-Name')!;
    input.value = 'Peter Smith';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    button(fixture, 'Сохранить')!.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(sent).toHaveLength(1);
    const values = columnValues(sent[0]);
    expect(Object.keys(values)).toEqual(['Name']);
    expect(values['Name']).toMatchObject({ parameter: { value: 'Peter Smith' } });

    expect(host(fixture).querySelector('input#field-Name')).toBeNull();
    expect(selectCount()).toBe(selectsBeforeSave + 1);
  });

  it('has nothing to save without edits', async () => {
    const { fixture } = configure(allRights);
    await open(fixture);

    button(fixture, 'Изменить')!.click();
    fixture.detectChanges();

    expect(button(fixture, 'Сохранить')!.disabled).toBe(true);
  });

  it('restores the original value on cancel', async () => {
    const { fixture, sent } = configure(allRights);
    await open(fixture);

    button(fixture, 'Изменить')!.click();
    fixture.detectChanges();
    const input = host(fixture).querySelector<HTMLInputElement>('input#field-Name')!;
    input.value = 'Another name';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    button(fixture, 'Отмена')!.click();
    fixture.detectChanges();

    expect(sent).toHaveLength(0);
    expect(host(fixture).textContent).toContain('John Smith');

    button(fixture, 'Изменить')!.click();
    fixture.detectChanges();

    expect(host(fixture).querySelector<HTMLInputElement>('input#field-Name')!.value).toBe(
      'John Smith',
    );
  });

  it('reports a server rejection and keeps the edits in place', async () => {
    const { fixture } = configure(allRights, true);
    await open(fixture);

    button(fixture, 'Изменить')!.click();
    fixture.detectChanges();
    const input = host(fixture).querySelector<HTMLInputElement>('input#field-Name')!;
    input.value = 'Peter Smith';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    button(fixture, 'Сохранить')!.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(host(fixture).querySelector('.alert-danger')!.textContent).toContain(
      'The record is locked',
    );
    expect(host(fixture).querySelector<HTMLInputElement>('input#field-Name')!.value).toBe(
      'Peter Smith',
    );
  });
});
