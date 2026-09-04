import { SerializedObject } from '../../serialization/serialized-object';
import { BaseQuery } from './base-query';
import { FilterGroup } from './filter-group';
import { CompareFilter } from './compare-filter';
import { BaseExpression } from './base-expression';
import { FilterUtils } from './filter-utils';
import { ComparisonType } from '../enums/comparison-type';
import { DataValueType } from '../../types/data-value-type';
import { BetweenFilter } from './between-filter';
import { BaseFilter } from './base-filter';
import { IncompleteFiltersException } from '../../exceptions/incomplete-filters.exception';
import { ParameterValueType } from '../types/parameter-value-type';

export abstract class BaseFilterableQuery<T> extends BaseQuery<T> {
  primaryColumnFilterName: string = 'primaryColumnFilter';

  private readonly filtersEnabledState: Map<string, boolean> = new Map<string, boolean>();

  filters: FilterGroup = new FilterGroup();

  primaryColumnFilter: CompareFilter | null = null;

  addFilter(column: string, columnAlias: BaseFilter): BaseFilter {
    return this.filters.addFilter(column, columnAlias);
  }

  hasEnabledPrimaryColumnFilter(): boolean {
    return this.primaryColumnFilter?.isEnabled === true;
  }

  disablePrimaryColumnFilter() {
    const primaryColumnFilter: CompareFilter | null = this.primaryColumnFilter;
    if (!primaryColumnFilter) {
      return;
    }
    primaryColumnFilter.isEnabled = false;
    this.filtersEnabledState.forEach((isEnabled, key) => {
      const filter: BaseFilter | undefined = this.filters.collection.get(key);
      if (filter) {
        filter.isEnabled = isEnabled;
      }
    });
    this.filtersEnabledState.clear();
  }

  enablePrimaryColumnFilter(primaryColumnValue: string): void {
    this.filtersEnabledState.clear();
    this.filters.collection.forEach((filter, key) => {
      if (filter === this.primaryColumnFilter) {
        return;
      }
      this.filtersEnabledState.set(key, filter.isEnabled);
      filter.isEnabled = false;
    });
    if (!this.primaryColumnFilter) {
      this.primaryColumnFilter = this.initPrimaryColumnFilter(primaryColumnValue);
    }
    this.primaryColumnFilter.isEnabled = true;
  }

  createCompareFilter(
    comparisonType: ComparisonType,
    leftExpression: BaseExpression,
    rightExpression: BaseExpression,
  ): CompareFilter {
    return FilterUtils.createCompareFilter(comparisonType, leftExpression, rightExpression);
  }

  createBetweenFilter(
    leftExpression: BaseExpression,
    rightLessExpression: BaseExpression,
    rightGreaterExpression: BaseExpression,
  ): BetweenFilter {
    return FilterUtils.createBetweenFilter(
      leftExpression,
      rightLessExpression,
      rightGreaterExpression,
    );
  }

  createColumnFilterWithParameter(
    comparisonType: ComparisonType,
    columnPath: string,
    paramValue: ParameterValueType,
  ): CompareFilter {
    return FilterUtils.createColumnFilterWithParameter(comparisonType, columnPath, paramValue);
  }

  protected validateFilters(): void {
    if (this.filters.isEmpty()) {
      return;
    }
    if (!this.filters.getIsCompleted(true)) {
      throw new IncompleteFiltersException(
        'Not all query filters are complete. An incomplete filter will not reach the request, ' +
          'and the wrong records will be selected.',
      );
    }
  }

  protected override prepareSerializableObject(
    serializableObject: SerializedObject,
  ): SerializedObject {
    serializableObject = super.prepareSerializableObject(serializableObject);
    serializableObject['filters'] = this.getSerializableProperty(this.filters);
    return serializableObject;
  }

  private initPrimaryColumnFilter(primaryColumnValue: string): CompareFilter {
    const primaryColumnFilter: CompareFilter = FilterUtils.createPrimaryColumnFilterWithParameter(
      ComparisonType.EQUAL,
      primaryColumnValue,
      DataValueType.GUID,
    );
    primaryColumnFilter.isEnabled = false;
    this.filters.addFilter(this.primaryColumnFilterName, primaryColumnFilter);
    return primaryColumnFilter;
  }
}
