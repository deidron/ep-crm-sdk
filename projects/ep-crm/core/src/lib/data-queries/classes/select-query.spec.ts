import { ArgumentNullOrEmptyException } from '../../exceptions/argument.exception';
import { DataValueType } from '../../types/data-value-type';
import { ComparisonType } from '../enums/comparison-type';
import { OrderDirection } from '../enums/order-direction';
import { QueryOperationType } from '../enums/query-operation-type';
import { FilterUtils } from './filter-utils';
import { SelectQuery } from './select-query';

/* The assertions below walk the serialized query by name, the way the platform reads it. There is
   no type to give that tree that would not be a second, hand-written copy of the serializer. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serialized(query: SelectQuery): any {
  return JSON.parse(query.serialize());
}

describe('SelectQuery', () => {
  it('assembles a select the way the application builds it', () => {
    const query: SelectQuery = new SelectQuery('Contact');
    ['Id', 'CreatedOn', 'ModifiedOn'].forEach((column) => query.addColumn(column, column));
    query.columns.collection.get('CreatedOn')?.withOrdering(OrderDirection.DESC, 0);
    query.rowCount = 10;

    const dto = serialized(query);
    expect(dto.rootSchemaName).toBe('Contact');
    expect(dto.operationType).toBe(QueryOperationType.SELECT);
    expect(dto.rowCount).toBe(10);
    expect(Object.keys(dto.columns.items)).toEqual(['Id', 'CreatedOn', 'ModifiedOn']);
    expect(dto.columns.items['CreatedOn'].orderDirection).toBe(OrderDirection.DESC);
    expect(dto.columns.items['Id'].expression.columnPath).toBe('Id');
  });

  it('takes the alias from the column name when none is given', () => {
    const query: SelectQuery = new SelectQuery('Contact');
    query.addColumn('Name');
    expect(Object.keys(serialized(query).columns.items)).toEqual(['Name']);
  });

  it('emits no hierarchy settings while it is switched off', () => {
    const dto = serialized(new SelectQuery('Contact'));
    expect(dto.isHierarchical).toBe(false);
    expect(dto).not.toHaveProperty('hierarchicalColumnName');
  });

  it('emits the hierarchy settings when it is switched on', () => {
    const query: SelectQuery = new SelectQuery('Contact');
    query.isHierarchical = true;
    query.hierarchicalColumnName = 'ParentId';
    query.hierarchicalMaxDepth = 3;
    const dto = serialized(query);
    expect(dto.hierarchicalColumnName).toBe('ParentId');
    expect(dto.hierarchicalMaxDepth).toBe(3);
  });

  it('includes the filters in the request body', () => {
    const query: SelectQuery = new SelectQuery('Contact');
    query.addColumn('Id');
    query.addFilter(
      'byName',
      FilterUtils.createColumnFilterWithParameter(ComparisonType.EQUAL, 'Name', 'Smith'),
    );
    const filter = serialized(query).filters.items['byName'];
    expect(filter.comparisonType).toBe(ComparisonType.EQUAL);
    expect(filter.leftExpression.columnPath).toBe('Name');
    expect(filter.rightExpression.parameter.value).toBe('Smith');
  });

  it('encodes a date parameter as a quoted string', () => {
    const query: SelectQuery = new SelectQuery('Activity');
    query.addColumn('Id');
    query.addFilter(
      'byDate',
      FilterUtils.createColumnFilterWithParameter(
        ComparisonType.GREATER,
        'CreatedOn',
        new Date(2018, 1, 20, 15, 10, 30),
      ),
    );
    const parameter = serialized(query).filters.items['byDate'].rightExpression.parameter;
    expect(parameter.value).toBe('"2018-02-20T15:10:30.000"');

    expect(parameter.dataValueType).toBe(DataValueType.TEXT);
  });

  it('encodes a date by the declared type even when the value came as a string', () => {
    const query: SelectQuery = new SelectQuery('Activity');
    query.addColumn('Id');
    query.addFilter(
      'byPeriod',
      FilterUtils.createColumnBetweenFilterWithParameters(
        'CreatedOn',
        new Date(2020, 0, 1),
        new Date(2020, 11, 31),
        DataValueType.DATE_TIME,
      ),
    );
    const filter = serialized(query).filters.items['byPeriod'];
    expect(filter.rightLessExpression.parameter.dataValueType).toBe(DataValueType.DATE_TIME);
    expect(filter.rightLessExpression.parameter.value).toBe('"2020-01-01T00:00:00.000"');
    expect(filter.rightGreaterExpression.parameter.value).toBe('"2020-12-31T00:00:00.000"');
  });

  it('requires an alias for an expression column', () => {
    const query: SelectQuery = new SelectQuery('Contact');
    expect(() => query.columns.addQueryColumn({} as never, '')).toThrow(
      ArgumentNullOrEmptyException,
    );
  });
});
