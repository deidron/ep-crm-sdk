import { DataValueType } from '../types/data-value-type';
import { Entity, EntityColumnsConfig, RawEntity } from './entity';
import { deserializeEntities, deserializeEntity } from './entity-deserializer';

const columnsConfig: EntityColumnsConfig = {
  Id: { dataValueType: DataValueType.GUID },
  BirthDate: { dataValueType: DataValueType.DATE },
  From: { dataValueType: DataValueType.TIME },
  CreatedOn: { dataValueType: DataValueType.DATE_TIME },
  Name: { dataValueType: DataValueType.TEXT },
};

const raw: RawEntity = {
  Id: 'r1',
  BirthDate: '1985-03-12',
  From: '2026-09-06T09:00:00.000',
  CreatedOn: '2026-09-06T18:15:00.000',
  Name: '2026-09-06T18:15:00.000',
};

describe('deserializeEntity', () => {
  it('parses every column that carries a moment in time', () => {
    const entity: Entity = deserializeEntity(columnsConfig, raw);

    expect(entity['BirthDate']).toBeInstanceOf(Date);
    expect(entity['From']).toBeInstanceOf(Date);
    expect(entity['CreatedOn']).toBeInstanceOf(Date);
  });

  it('keeps the whole moment a time column is stored with', () => {
    const from = deserializeEntity(columnsConfig, raw)['From'] as Date;

    expect(from.getFullYear()).toBe(2026);
    expect(from.getMonth()).toBe(8);
    expect(from.getDate()).toBe(6);
    expect(from.getHours()).toBe(9);
    expect(from.getMinutes()).toBe(0);
  });

  it('leaves a column of any other type as it came', () => {
    const entity: Entity = deserializeEntity(columnsConfig, raw);

    expect(entity['Id']).toBe('r1');
    expect(entity['Name']).toBe('2026-09-06T18:15:00.000');
  });

  it('passes through a column the config says nothing about', () => {
    const entity: Entity = deserializeEntity(columnsConfig, { Unknown: '2026-09-06T09:00:00.000' });

    expect(entity['Unknown']).toBe('2026-09-06T09:00:00.000');
  });

  it('leaves an empty value alone', () => {
    const entity: Entity = deserializeEntity(columnsConfig, { From: null, CreatedOn: '' });

    expect(entity['From']).toBeNull();
    expect(entity['CreatedOn']).toBeNull();
  });
});

describe('deserializeEntities', () => {
  it('parses each row of the response', () => {
    const entities: Entity[] = deserializeEntities(columnsConfig, [raw, raw]);

    expect(entities).toHaveLength(2);
    expect(entities.every((entity) => entity['From'] instanceof Date)).toBe(true);
  });

  it('returns the rows untouched without a config', () => {
    expect(deserializeEntities(null as unknown as EntityColumnsConfig, [raw])).toEqual([raw]);
  });
});
