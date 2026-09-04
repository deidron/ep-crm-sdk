import { AggregationEvalType } from '../enums/aggregation-eval-type';
import { AggregationType } from '../enums/aggregation-type';
import { FunctionType } from '../enums/function-type';
import { BaseExpression } from './base-expression';
import { FunctionExpression } from './function-expression';

export class AggregationFunctionExpression extends FunctionExpression {
  constructor(
    aggregationType: AggregationType,
    aggregationEvalType: AggregationEvalType,
    functionArgument: BaseExpression,
  ) {
    super();
    this.functionType = FunctionType.AGGREGATION;
    this.aggregationType = aggregationType;
    this.aggregationEvalType = aggregationEvalType;
    this.functionArgument = functionArgument;
  }
}
