import { ArgumentNullOrEmptyException } from '../../exceptions/argument.exception';
import { UnsupportedTypeException } from '../../exceptions/unsupported-type.exception';
import { FilterType } from '../enums/filter-type';
import { LogicalOperatorType } from '../enums/logical-operator-type';
import {
  SerializedBetweenFilter,
  SerializedCompareFilter,
  SerializedExistsFilter,
  SerializedFilter,
  SerializedFilterGroup,
  SerializedFilterOrGroup,
  SerializedInFilter,
  SerializedIsNullFilter,
} from '../dto/serialized-filter';
import { BaseExpression } from './base-expression';
import { BaseFilter } from './base-filter';
import { BetweenFilter } from './between-filter';
import { CompareFilter } from './compare-filter';
import { ExistsFilter } from './exists-filter';
import { ExpressionParser } from './expression-parser';
import { FilterGroup } from './filter-group';
import { InFilter } from './in-filter';
import { IsNullFilter } from './is-null-filter';

export class FilterParser {
  static fromJson(dto: SerializedFilterOrGroup): BaseFilter | FilterGroup {
    if (!dto) {
      throw new ArgumentNullOrEmptyException('dto');
    }
    if (dto.filterType === FilterType.FILTER_GROUP) {
      return this.parseGroup(dto);
    }
    const filter: BaseFilter = this.parseFilter(dto);
    filter.isEnabled = dto.isEnabled !== false;
    filter.trimDateTimeParameterToDate = dto.trimDateTimeParameterToDate === true;
    if (dto.referenceSchemaName) {
      filter.referenceSchemaName = dto.referenceSchemaName;
    }
    if (dto.key) {
      filter.key = dto.key;
    }
    return filter;
  }

  private static parseGroup(dto: SerializedFilterGroup): FilterGroup {
    const group: FilterGroup = new FilterGroup();
    group.logicalOperation = dto.logicalOperation ?? LogicalOperatorType.AND;
    group.isEnabled = dto.isEnabled !== false;
    if (dto.rootSchemaName) {
      group.rootSchemaName = dto.rootSchemaName;
    }
    if (dto.key) {
      group.key = dto.key;
    }
    Object.entries(dto.items ?? {}).forEach(([key, filterDto]) => {
      group.addFilter(key, this.fromJson(filterDto) as BaseFilter);
    });
    return group;
  }

  private static parseFilter(dto: SerializedFilter): BaseFilter {
    switch (dto.filterType) {
      case FilterType.COMPARE:
        return this.parseCompare(dto);
      case FilterType.IS_NULL:
        return this.parseIsNull(dto);
      case FilterType.BETWEEN:
        return this.parseBetween(dto);
      case FilterType.IN:
        return this.parseIn(dto);
      case FilterType.EXISTS:
        return this.parseExists(dto);
      default: {
        const unsupported: never = dto;
        throw new UnsupportedTypeException(
          'filterType',
          (unsupported as SerializedFilter).filterType,
        );
      }
    }
  }

  private static parseCompare(dto: SerializedCompareFilter): CompareFilter {
    const filter: CompareFilter = new CompareFilter();
    filter.comparisonType = dto.comparisonType;
    filter.leftExpression = this.parseLeft(dto);
    filter.rightExpression = ExpressionParser.fromJson(dto.rightExpression);
    return filter;
  }

  private static parseIsNull(dto: SerializedIsNullFilter): IsNullFilter {
    const filter: IsNullFilter = new IsNullFilter();
    filter.leftExpression = this.parseLeft(dto);
    filter.comparisonType = dto.comparisonType;
    return filter;
  }

  private static parseBetween(dto: SerializedBetweenFilter): BetweenFilter {
    const filter: BetweenFilter = new BetweenFilter();
    filter.leftExpression = this.parseLeft(dto);
    filter.rightLessExpression = ExpressionParser.fromJson(dto.rightLessExpression);
    filter.rightGreaterExpression = ExpressionParser.fromJson(dto.rightGreaterExpression);
    return filter;
  }

  private static parseIn(dto: SerializedInFilter): InFilter {
    const filter: InFilter = new InFilter();
    filter.leftExpression = this.parseLeft(dto);
    filter.comparisonType = dto.comparisonType;
    filter.rightExpressions = (dto.rightExpressions ?? []).map((expression) =>
      ExpressionParser.fromJson(expression),
    );
    return filter;
  }

  private static parseExists(dto: SerializedExistsFilter): ExistsFilter {
    const filter: ExistsFilter = new ExistsFilter();
    filter.leftExpression = this.parseLeft(dto);
    filter.comparisonType = dto.comparisonType;
    if (dto.subFilters) {
      filter.subFilters = this.fromJson(dto.subFilters) as FilterGroup;
    }
    if (typeof dto.isAggregative === 'boolean') {
      filter.isAggregative = dto.isAggregative;
    }
    return filter;
  }

  private static parseLeft(dto: SerializedFilter): BaseExpression {
    return ExpressionParser.fromJson(dto.leftExpression);
  }
}
