import { ComparisonType } from '../enums/comparison-type';
import { FilterType } from '../enums/filter-type';
import { LogicalOperatorType } from '../enums/logical-operator-type';
import { SerializedExpression } from './serialized-expression';

interface SerializedFilterBase {
  comparisonType: ComparisonType;
  leftExpression: SerializedExpression;
  isEnabled?: boolean;
  trimDateTimeParameterToDate?: boolean;
  referenceSchemaName?: string;
  key?: string;
  isAggregative?: boolean;
}

export interface SerializedCompareFilter extends SerializedFilterBase {
  filterType: FilterType.COMPARE;
  rightExpression: SerializedExpression;
}

export interface SerializedIsNullFilter extends SerializedFilterBase {
  filterType: FilterType.IS_NULL;
  isNull?: boolean;
}

export interface SerializedBetweenFilter extends SerializedFilterBase {
  filterType: FilterType.BETWEEN;
  rightLessExpression: SerializedExpression;
  rightGreaterExpression: SerializedExpression;
}

export interface SerializedInFilter extends SerializedFilterBase {
  filterType: FilterType.IN;
  rightExpressions?: SerializedExpression[];
}

export interface SerializedExistsFilter extends SerializedFilterBase {
  filterType: FilterType.EXISTS;
  subFilters?: SerializedFilterGroup;
}

export interface SerializedFilterGroup {
  filterType: FilterType.FILTER_GROUP;
  items?: Record<string, SerializedFilterOrGroup>;
  logicalOperation?: LogicalOperatorType;
  isEnabled?: boolean;
  rootSchemaName?: string;
  key?: string;
}

export type SerializedFilter =
  | SerializedCompareFilter
  | SerializedIsNullFilter
  | SerializedBetweenFilter
  | SerializedInFilter
  | SerializedExistsFilter;

export type SerializedFilterOrGroup = SerializedFilter | SerializedFilterGroup;
