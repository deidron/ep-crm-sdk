import { ArgumentNullOrEmptyException } from '../../exceptions/argument.exception';
import { UnsupportedTypeException } from '../../exceptions/unsupported-type.exception';
import { SerializedFilterOrGroup } from '../dto/serialized-filter';
import { DataValueType } from '../../types/data-value-type';
import { ComparisonType } from '../enums/comparison-type';
import { FilterType } from '../enums/filter-type';
import { LogicalOperatorType } from '../enums/logical-operator-type';
import { BaseFilter } from './base-filter';
import { FilterGroup } from './filter-group';
import { FilterParser } from './filter-parser';
import { FilterUtils } from './filter-utils';
import { IsNullFilter } from './is-null-filter';

function expectRoundTrip(filter: BaseFilter | FilterGroup): void {
  const serialized: string = filter.serialize();
  const restored: BaseFilter | FilterGroup = FilterParser.fromJson(JSON.parse(serialized));
  expect(JSON.parse(restored.serialize())).toEqual(JSON.parse(serialized));
}

describe('FilterParser round-trip', () => {
  it('restores a column comparison with a text parameter', () => {
    expectRoundTrip(
      FilterUtils.createColumnFilterWithParameter(ComparisonType.EQUAL, 'Name', 'Smith'),
    );
  });

  it('restores a comparison of two columns', () => {
    expectRoundTrip(FilterUtils.createFilter(ComparisonType.NOT_EQUAL, 'CreatedOn', 'ModifiedOn'));
  });

  it('restores a null check', () => {
    expectRoundTrip(FilterUtils.createColumnIsNullFilter('Email'));
    expectRoundTrip(FilterUtils.createColumnIsNotNullFilter('Email'));
  });

  it('restores a date range', () => {
    expectRoundTrip(
      FilterUtils.createColumnBetweenFilterWithParameters(
        'CreatedOn',
        new Date(2020, 0, 1, 10, 0, 0),
        new Date(2020, 11, 31, 20, 30, 0),
        DataValueType.DATE_TIME,
      ),
    );
  });

  it('restores membership in a list', () => {
    expectRoundTrip(
      FilterUtils.createColumnInFilterWithParameters(
        'Type',
        ['first', 'second'],
        DataValueType.TEXT,
      ),
    );
  });

  it('restores a group with nested filters', () => {
    const group: FilterGroup = new FilterGroup();
    group.logicalOperation = LogicalOperatorType.OR;
    group.key = 'main';
    group.rootSchemaName = 'Contact';
    group.addFilter(
      'byName',
      FilterUtils.createColumnFilterWithParameter(ComparisonType.EQUAL, 'Name', 'Smith'),
    );
    group.addFilter('withoutEmail', FilterUtils.createColumnIsNullFilter('Email'));
    expectRoundTrip(group);
  });

  it('preserves the disabled state of a filter', () => {
    const filter: BaseFilter = FilterUtils.createColumnFilterWithParameter(
      ComparisonType.EQUAL,
      'Name',
      'Smith',
    );
    filter.isEnabled = false;
    const restored = FilterParser.fromJson(JSON.parse(filter.serialize()));
    expect(restored.isEnabled).toBe(false);
  });
});

describe('IsNullFilter', () => {
  it('exposes comparisonType through the getter', () => {
    const filter: IsNullFilter = FilterUtils.createColumnIsNullFilter('Email');
    expect(filter.comparisonType).toBe(ComparisonType.IS_NULL);
    expect(FilterUtils.createColumnIsNotNullFilter('Email').comparisonType).toBe(
      ComparisonType.IS_NOT_NULL,
    );
  });

  it('includes comparisonType in the serialization like the other filters', () => {
    const serialized = JSON.parse(FilterUtils.createColumnIsNullFilter('Email').serialize());
    expect(serialized.comparisonType).toBe(ComparisonType.IS_NULL);
    expect(serialized.filterType).toBe(FilterType.IS_NULL);
    expect(serialized.isNull).toBe(true);
  });
});

describe('FilterParser: errors', () => {
  function parseInvalid(dto: unknown): BaseFilter | FilterGroup {
    return FilterParser.fromJson(dto as SerializedFilterOrGroup);
  }

  it('throws ArgumentNullOrEmptyException on an empty object', () => {
    expect(() => parseInvalid(null)).toThrow(ArgumentNullOrEmptyException);
  });

  it('names the offending argument', () => {
    try {
      parseInvalid(undefined);
      expect.unreachable('an exception was expected');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as ArgumentNullOrEmptyException).argumentName).toBe('dto');
    }
  });

  it('throws UnsupportedTypeException on an unknown filterType', () => {
    const dto = { filterType: 999, leftExpression: { expressionType: 0, columnPath: 'Name' } };
    expect(() => parseInvalid(dto)).toThrow(UnsupportedTypeException);
  });
});
