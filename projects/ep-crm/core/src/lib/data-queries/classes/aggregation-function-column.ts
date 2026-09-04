import { AggregationEvalType } from '../enums/aggregation-eval-type';
import { AggregationType } from '../enums/aggregation-type';
import { AggregationFunctionExpression } from './aggregation-function-expression';
import { BaseExpression } from './base-expression';
import { BaseQueryColumn } from './base-query-column';

export class AggregationFunctionColumn extends BaseQueryColumn {
  constructor(
    aggregationType: AggregationType,
    aggregationEvalType: AggregationEvalType,
    functionArgument: BaseExpression,
  ) {
    super(
      new AggregationFunctionExpression(aggregationType, aggregationEvalType, functionArgument),
    );
  }
}
