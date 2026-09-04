import { SerializedObject } from '../../serialization/serialized-object';
import { ArgumentNullOrEmptyException } from '../../exceptions/argument.exception';
import { BaseExpression } from './base-expression';
import { ExpressionType } from '../enums/expression-type';
import { FunctionType } from '../enums/function-type';
import { QueryMacrosType } from '../enums/query-macros-type';
import { AggregationType } from '../enums/aggregation-type';
import { AggregationEvalType } from '../enums/aggregation-eval-type';
import { DatePartType } from '../enums/date-part-type';

export class FunctionExpression extends BaseExpression {
  override expressionType: ExpressionType = ExpressionType.FUNCTION;

  functionType?: FunctionType;

  macrosType?: QueryMacrosType;

  aggregationType?: AggregationType;

  aggregationEvalType?: AggregationEvalType;

  datePartType?: DatePartType;

  functionArgument?: BaseExpression | string | number;

  functionArguments?: BaseExpression[];

  protected override prepareSerializableObject(
    serializableObject: SerializedObject,
  ): SerializedObject {
    serializableObject = super.prepareSerializableObject(serializableObject);
    if (!this.functionType) {
      throw new ArgumentNullOrEmptyException('functionType');
    }
    serializableObject['functionType'] = this.functionType;
    if (this.functionArgument) {
      const functionArgument =
        this.functionArgument instanceof BaseExpression
          ? this.getSerializableProperty(this.functionArgument)
          : this.functionArgument;
      serializableObject['functionArgument'] = functionArgument;
    }
    if (this.macrosType) {
      serializableObject['macrosType'] = this.macrosType;
    }
    if (this.datePartType) {
      serializableObject['datePartType'] = this.datePartType;
    }
    if (this.aggregationType) {
      serializableObject['aggregationType'] = this.aggregationType;
    }
    if (this.aggregationEvalType) {
      serializableObject['aggregationEvalType'] = this.aggregationEvalType;
    }
    return serializableObject;
  }
}
