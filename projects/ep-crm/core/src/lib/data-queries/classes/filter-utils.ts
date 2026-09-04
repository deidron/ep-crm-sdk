import { BaseExpression } from './base-expression';
import { BetweenFilter } from './between-filter';
import { ColumnExpression } from './column-expression';
import { CompareFilter } from './compare-filter';
import { ComparisonType } from '../enums/comparison-type';
import { DataValueType } from '../../types/data-value-type';
import { DatePartType } from '../enums/date-part-type';
import { FunctionType } from '../enums/function-type';
import { QueryMacrosType } from '../enums/query-macros-type';
import { ExistsFilter } from './exists-filter';
import { FilterGroup } from './filter-group';
import { FunctionExpression } from './function-expression';
import { InFilter } from './in-filter';
import { IsNullFilter } from './is-null-filter';
import { ParameterExpression } from './parameter-expression';
import { ParameterValueType } from '../types/parameter-value-type';

export class FilterUtils {
  static createCompareFilter(
    comparisonType: ComparisonType,
    leftExpression: BaseExpression,
    rightExpression: BaseExpression,
  ): CompareFilter {
    const filter: CompareFilter = new CompareFilter();
    filter.comparisonType = comparisonType;
    filter.leftExpression = leftExpression;
    filter.rightExpression = rightExpression;
    return filter;
  }

  static createBetweenFilter(
    leftExpression: BaseExpression,
    rightLessExpression: BaseExpression,
    rightGreaterExpression: BaseExpression,
  ): BetweenFilter {
    const filter: BetweenFilter = new BetweenFilter();
    filter.leftExpression = leftExpression;
    filter.rightLessExpression = rightLessExpression;
    filter.rightGreaterExpression = rightGreaterExpression;
    return filter;
  }

  static createIsNullFilter(leftExpression: BaseExpression) {
    const filter: IsNullFilter = new IsNullFilter();
    filter.leftExpression = leftExpression;
    filter.comparisonType = ComparisonType.IS_NULL;
    return filter;
  }

  static createIsNotNullFilter(leftExpression: BaseExpression) {
    const filter: IsNullFilter = new IsNullFilter();
    filter.leftExpression = leftExpression;
    filter.comparisonType = ComparisonType.IS_NOT_NULL;
    return filter;
  }

  static createInFilter(
    leftExpression: BaseExpression,
    rightExpressions: BaseExpression[],
  ): InFilter {
    const filter: InFilter = new InFilter();
    filter.leftExpression = leftExpression;
    filter.rightExpressions = rightExpressions;
    return filter;
  }

  static createFilter(
    comparisonType: ComparisonType,
    leftColumnPath: string,
    rightColumnPath: string,
  ): CompareFilter {
    const leftExpression: ColumnExpression = new ColumnExpression(leftColumnPath);
    const rightExpression: ColumnExpression = new ColumnExpression(rightColumnPath);
    return FilterUtils.createCompareFilter(comparisonType, leftExpression, rightExpression);
  }

  static createColumnFilterWithParameter(
    comparisonType: ComparisonType,
    columnPath: string,
    paramValue: ParameterValueType,
  ): CompareFilter {
    const leftExpression: ColumnExpression = new ColumnExpression(columnPath);
    const rightExpression: ParameterExpression = new ParameterExpression();
    rightExpression.parameterValue = paramValue;
    return FilterUtils.createCompareFilter(comparisonType, leftExpression, rightExpression);
  }

  static createPrimaryColumnFilterWithParameter(
    comparisonType: ComparisonType,
    paramValue: ParameterValueType,
    paramDataType: DataValueType,
  ): CompareFilter {
    return this.createPrimaryColumnFilter(
      comparisonType,
      QueryMacrosType.PRIMARY_COLUMN,
      paramValue,
      paramDataType,
    );
  }

  static createPrimaryDisplayColumnFilterWithParameter(
    comparisonType: ComparisonType,
    paramValue: ParameterValueType,
    paramDataType: DataValueType,
  ): CompareFilter {
    return this.createPrimaryColumnFilter(
      comparisonType,
      QueryMacrosType.PRIMARY_DISPLAY_COLUMN,
      paramValue,
      paramDataType,
    );
  }

  static createColumnBetweenFilterWithParameters(
    columnPath: string,
    lessParamValue: ParameterValueType,
    greaterParamValue: ParameterValueType,
    paramDataType: DataValueType,
  ): BetweenFilter {
    const leftExpression: ColumnExpression = new ColumnExpression(columnPath);
    const rightLessExpression: ParameterExpression = new ParameterExpression();
    rightLessExpression.parameterValue = lessParamValue;
    rightLessExpression.parameterDataType = paramDataType;
    const rightGreaterExpression: ParameterExpression = new ParameterExpression();
    rightGreaterExpression.parameterValue = greaterParamValue;
    rightGreaterExpression.parameterDataType = paramDataType;
    return FilterUtils.createBetweenFilter(
      leftExpression,
      rightLessExpression,
      rightGreaterExpression,
    );
  }

  static createColumnIsNullFilter(columnPath: string) {
    const leftExpression: ColumnExpression = new ColumnExpression(columnPath);
    return FilterUtils.createIsNullFilter(leftExpression);
  }

  static createColumnIsNotNullFilter(columnPath: string) {
    const leftExpression: ColumnExpression = new ColumnExpression(columnPath);
    return FilterUtils.createIsNotNullFilter(leftExpression);
  }

  static createColumnInFilterWithParameters(
    columnPath: string,
    parameterValues: ParameterValueType[],
    paramDataType: DataValueType,
  ) {
    const leftExpression: ColumnExpression = new ColumnExpression(columnPath);
    const rightExpressions: BaseExpression[] = parameterValues.map((value) => {
      const parameterValue: ParameterExpression = new ParameterExpression();
      parameterValue.parameterValue = value;
      parameterValue.parameterDataType = paramDataType;
      return parameterValue;
    });
    return FilterUtils.createInFilter(leftExpression, rightExpressions);
  }

  static createExistsFilter(columnPath: string, subFilters: FilterGroup) {
    const leftExpression: ColumnExpression = new ColumnExpression(columnPath);
    const filter: ExistsFilter = new ExistsFilter();
    filter.comparisonType = ComparisonType.EXISTS;
    filter.leftExpression = leftExpression;
    filter.subFilters = subFilters;
    return filter;
  }

  static createNotExistsFilter(columnPath: string, subFilters: FilterGroup) {
    const leftExpression: ColumnExpression = new ColumnExpression(columnPath);
    const filter: ExistsFilter = new ExistsFilter();
    filter.comparisonType = ComparisonType.NOT_EXISTS;
    filter.leftExpression = leftExpression;
    filter.subFilters = subFilters;
    return filter;
  }
  static createDatePartColumnFilter(
    comparisonType: ComparisonType,
    columnPath: string,
    datePartType: DatePartType,
    datePartValue: ParameterValueType,
  ) {
    const leftExpression: FunctionExpression = new FunctionExpression();
    leftExpression.functionType = FunctionType.DATE_PART;
    leftExpression.datePartType = datePartType;
    const functionArgument: ColumnExpression = new ColumnExpression(columnPath);
    leftExpression.functionArgument = functionArgument;
    const rightExpression: ParameterExpression = new ParameterExpression();
    rightExpression.parameterValue = datePartValue;
    rightExpression.parameterDataType = DataValueType.INTEGER;
    return FilterUtils.createCompareFilter(comparisonType, leftExpression, rightExpression);
  }

  private static createPrimaryColumnFilter(
    comparisonType: ComparisonType,
    macrosType: QueryMacrosType,
    paramValue: ParameterValueType,
    paramDataType: DataValueType,
  ): CompareFilter {
    const leftExpression: FunctionExpression = new FunctionExpression();
    leftExpression.functionType = FunctionType.MACROS;
    leftExpression.macrosType = macrosType;
    const rightExpression: ParameterExpression = new ParameterExpression();
    rightExpression.parameterValue = paramValue;
    rightExpression.parameterDataType = paramDataType;
    return FilterUtils.createCompareFilter(comparisonType, leftExpression, rightExpression);
  }
}
