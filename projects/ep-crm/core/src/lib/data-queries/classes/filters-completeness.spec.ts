import { BetweenFilter } from './between-filter';
import { ColumnExpression } from './column-expression';
import { CompareFilter } from './compare-filter';
import { ComparisonType } from '../enums/comparison-type';
import { DataValueType } from '../../types/data-value-type';
import { ExistsFilter } from './exists-filter';
import { FilterUtils } from './filter-utils';
import { ParameterExpression } from './parameter-expression';
import { SelectQuery } from './select-query';
import { DeleteQuery } from './delete-query';
import { UpdateQuery } from './update-query';
import { IncompleteFiltersException } from '../../exceptions/incomplete-filters.exception';

function serializedFilterKeys(query: SelectQuery): string[] {
  return Object.keys(JSON.parse(query.serialize())['filters']['items']);
}

describe('Filter completeness', () => {
  it('treats a comparison without a right part as incomplete', () => {
    const filter: CompareFilter = new CompareFilter();
    filter.leftExpression = new ColumnExpression('Name');

    expect(filter.getIsCompleted()).toBe(false);
  });

  it('treats a comparison without a left part as incomplete', () => {
    const filter: CompareFilter = new CompareFilter();
    filter.rightExpression = new ParameterExpression('Smith', DataValueType.TEXT);

    expect(filter.getIsCompleted()).toBe(false);
  });

  it('treats a comparison with an empty parameter value as incomplete', () => {
    const filter: CompareFilter = FilterUtils.createColumnFilterWithParameter(
      ComparisonType.EQUAL,
      'Name',
      null,
    );

    expect(filter.getIsCompleted()).toBe(false);
  });

  it('accepts an empty string as a comparison value', () => {
    const filter: CompareFilter = FilterUtils.createColumnFilterWithParameter(
      ComparisonType.EQUAL,
      'Name',
      '',
    );

    expect(filter.getIsCompleted()).toBe(true);
  });

  it('treats a range missing one of its bounds as incomplete', () => {
    const filter: BetweenFilter = new BetweenFilter();
    filter.leftExpression = new ColumnExpression('CreatedOn');
    filter.rightLessExpression = new ParameterExpression('2020-01-01', DataValueType.DATE);

    expect(filter.getIsCompleted()).toBe(false);
  });

  it('treats a range with an empty bound as incomplete', () => {
    const filter: BetweenFilter = new BetweenFilter();
    filter.leftExpression = new ColumnExpression('CreatedOn');
    filter.rightLessExpression = new ParameterExpression('2020-01-01', DataValueType.DATE);
    filter.rightGreaterExpression = new ParameterExpression('', DataValueType.DATE);

    expect(filter.getIsCompleted()).toBe(false);
  });

  it('treats an exists condition as always complete', () => {
    expect(new ExistsFilter().getIsCompleted()).toBe(true);
  });
});

describe('Filter group serialization', () => {
  it('does not send an incomplete filter', () => {
    const query: SelectQuery = new SelectQuery('Contact');
    query.addColumn('Name');
    query.addFilter(
      'ready',
      FilterUtils.createColumnFilterWithParameter(ComparisonType.EQUAL, 'Name', 'Smith'),
    );
    query.addFilter(
      'empty',
      FilterUtils.createColumnFilterWithParameter(ComparisonType.EQUAL, 'Email', null),
    );

    expect(serializedFilterKeys(query)).toEqual(['ready']);
  });

  it('treats a group as complete when all its filters are complete', () => {
    const query: SelectQuery = new SelectQuery('Contact');
    query.addFilter(
      'ready',
      FilterUtils.createColumnFilterWithParameter(ComparisonType.EQUAL, 'Name', 'Smith'),
    );

    expect(query.filters.getIsCompleted(true)).toBe(true);

    query.addFilter(
      'empty',
      FilterUtils.createColumnFilterWithParameter(ComparisonType.EQUAL, 'Email', null),
    );

    expect(query.filters.getIsCompleted(true)).toBe(false);
  });
});

describe('Primary column filtering', () => {
  function queryWithFilter(): SelectQuery {
    const query: SelectQuery = new SelectQuery('Contact');
    query.addColumn('Name');
    query.addFilter(
      'byName',
      FilterUtils.createColumnFilterWithParameter(ComparisonType.EQUAL, 'Name', 'Smith'),
    );
    return query;
  }

  it('switches the other filters off', () => {
    const query: SelectQuery = queryWithFilter();

    query.enablePrimaryColumnFilter('11111111-1111-1111-1111-111111111111');

    expect(query.filters.collection.get('byName')!.isEnabled).toBe(false);
    expect(query.primaryColumnFilter!.isEnabled).toBe(true);
  });

  it('restores the other filters to their previous state', () => {
    const query: SelectQuery = queryWithFilter();

    query.enablePrimaryColumnFilter('11111111-1111-1111-1111-111111111111');
    query.disablePrimaryColumnFilter();

    expect(query.filters.collection.get('byName')!.isEnabled).toBe(true);
    expect(query.primaryColumnFilter!.isEnabled).toBe(false);
  });

  it('does not switch back on what was already off before it', () => {
    const query: SelectQuery = queryWithFilter();
    query.filters.collection.get('byName')!.isEnabled = false;

    query.enablePrimaryColumnFilter('11111111-1111-1111-1111-111111111111');
    query.disablePrimaryColumnFilter();

    expect(query.filters.collection.get('byName')!.isEnabled).toBe(false);
  });
});

describe('Filter validation before sending', () => {
  function incompleteFilter() {
    return FilterUtils.createColumnFilterWithParameter(ComparisonType.EQUAL, 'Email', null);
  }

  function readyFilter() {
    return FilterUtils.createColumnFilterWithParameter(ComparisonType.EQUAL, 'Name', 'Smith');
  }

  it('does not send a delete carrying an incomplete filter', () => {
    const query: DeleteQuery = new DeleteQuery('Contact');
    query.addFilter('byName', readyFilter());
    query.addFilter('byEmail', incompleteFilter());

    expect(() => query.serialize()).toThrow(IncompleteFiltersException);
  });

  it('does not send an update carrying an incomplete filter', () => {
    const query: UpdateQuery = new UpdateQuery('Contact');
    query.setParameterValue('Name', 'Brown', DataValueType.TEXT);
    query.addFilter('byEmail', incompleteFilter());

    expect(() => query.serialize()).toThrow(IncompleteFiltersException);
  });

  it('sends a query without filters: the absence of conditions is deliberate', () => {
    const query: DeleteQuery = new DeleteQuery('Contact');

    expect(() => query.serialize()).not.toThrow();
  });

  it('does not block sending when the filters are complete', () => {
    const query: DeleteQuery = new DeleteQuery('Contact');
    query.addFilter('byName', readyFilter());

    expect(() => query.serialize()).not.toThrow();
  });

  it('does not block a select when a filter is incomplete', () => {
    const query: SelectQuery = new SelectQuery('Contact');
    query.addColumn('Name');
    query.addFilter('byEmail', incompleteFilter());

    expect(() => query.serialize()).not.toThrow();
  });
});

describe('The primary column filter name', () => {
  it('matches the one the server looks for', () => {
    const query: SelectQuery = new SelectQuery('Contact');

    expect(query.primaryColumnFilterName).toBe('primaryColumnFilter');
  });

  it('adds the filter under that very key', () => {
    const query: SelectQuery = new SelectQuery('Contact');

    query.enablePrimaryColumnFilter('11111111-1111-1111-1111-111111111111');

    expect(query.filters.collection.has('primaryColumnFilter')).toBe(true);
  });
});
