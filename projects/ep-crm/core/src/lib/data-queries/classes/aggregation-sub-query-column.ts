import { AggregationType } from '../enums/aggregation-type';
import { OrderDirection } from '../enums/order-direction';
import { AggregationSubQueryExpression } from './aggregation-sub-query-expression';
import { BaseQueryColumn } from './base-query-column';
import { FilterGroup } from './filter-group';

export class AggregationSubQueryColumn extends BaseQueryColumn {
  constructor(
    columnPath: string,
    aggregationType: AggregationType,
    subFilters?: FilterGroup,
    subOrderDirection?: OrderDirection,
    subOrderColumn?: string,
  ) {
    super(
      new AggregationSubQueryExpression(
        columnPath,
        aggregationType,
        subFilters,
        subOrderDirection,
        subOrderColumn,
      ),
    );
  }
}
