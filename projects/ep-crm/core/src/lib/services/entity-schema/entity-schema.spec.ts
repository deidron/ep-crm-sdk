import { DataValueType } from '../../types/data-value-type';
import {
  EntitySchema,
  findPrimaryDisplayColumn,
  findSchemaColumn,
  getSchemaColumns,
} from './entity-schema';

const schema: EntitySchema = {
  uId: 'schema-uid',
  name: 'Activity',
  caption: { 'ru-RU': 'Активность', 'en-US': 'Activity' },
  columns: {
    Items: {
      'ae0e45ca-c495-4fe7-a39d-3ab7278e1617': {
        uId: 'ae0e45ca-c495-4fe7-a39d-3ab7278e1617',
        name: 'Id',
        caption: { 'ru-RU': 'Id', 'en-US': 'Id' },
        description: {},
        dataValueType: DataValueType.GUID,
        referenceSchemaName: null,
        referenceSchemaUId: null,
        isRequired: true,
        isInherited: true,
        isOverride: true,
        isVirtual: false,
        isValueCloneable: false,
        isMultilineText: false,
        isSimpleLookup: false,
        isCascade: false,
        isIndexed: false,
        isWeakReference: false,
        usageType: 1,
        status: 0,
      },
      'e80190a5-03b2-4095-90f7-a193a960adee': {
        uId: 'e80190a5-03b2-4095-90f7-a193a960adee',
        name: 'CreatedOn',
        caption: { 'ru-RU': 'Дата создания', 'en-US': 'Created on' },
        description: {},
        dataValueType: DataValueType.DATE_TIME,
        referenceSchemaName: null,
        referenceSchemaUId: null,
        isRequired: false,
        isInherited: true,
        isOverride: true,
        isVirtual: false,
        isValueCloneable: false,
        isMultilineText: false,
        isSimpleLookup: false,
        isCascade: false,
        isIndexed: false,
        isWeakReference: false,
        usageType: 1,
        status: 0,
      },
    },
  },
};

describe('getSchemaColumns', () => {
  it('expands the Items dictionary into a list', () => {
    expect(getSchemaColumns(schema).map((column) => column.name)).toEqual(['Id', 'CreatedOn']);
  });

  it('returns an empty list when there are no columns', () => {
    expect(getSchemaColumns({ uId: '1', name: 'Contact', caption: 'Contact' })).toEqual([]);
    expect(getSchemaColumns(null)).toEqual([]);
  });
});

describe('findSchemaColumn', () => {
  it('finds a column by name together with its type and caption', () => {
    const column = findSchemaColumn(schema, 'CreatedOn');
    expect(column?.dataValueType).toBe(DataValueType.DATE_TIME);
    expect(column?.caption).toEqual({ 'ru-RU': 'Дата создания', 'en-US': 'Created on' });
  });

  it('returns null for a column the object does not have', () => {
    expect(findSchemaColumn(schema, 'NoSuchColumn')).toBeNull();
  });
});

describe('findPrimaryDisplayColumn', () => {
  it('finds the column the schema names its records by', () => {
    const named: EntitySchema = {
      ...schema,
      primaryDisplayColumnUId: 'e80190a5-03b2-4095-90f7-a193a960adee',
    };

    expect(findPrimaryDisplayColumn(named)?.name).toBe('CreatedOn');
  });

  it('returns null for a schema that reports none', () => {
    expect(findPrimaryDisplayColumn(schema)).toBeNull();
    expect(findPrimaryDisplayColumn(null)).toBeNull();
  });

  it('returns null when the reported column is not among the columns', () => {
    expect(findPrimaryDisplayColumn({ ...schema, primaryDisplayColumnUId: 'absent' })).toBeNull();
  });
});
