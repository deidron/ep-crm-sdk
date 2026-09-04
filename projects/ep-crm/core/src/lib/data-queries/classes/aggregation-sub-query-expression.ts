import { SerializedObject } from '../../serialization/serialized-object';
import { AggregationType } from '../enums/aggregation-type';
import { FunctionType } from '../enums/function-type';
import { OrderDirection } from '../enums/order-direction';
import { FilterGroup } from './filter-group';
import { SubQueryExpression } from './sub-query-expression';

export class AggregationSubQueryExpression extends SubQueryExpression {
  aggregationType: AggregationType;

  functionType?: FunctionType;

  constructor(
    columnPath: string,
    aggregationType: AggregationType,
    subFilters?: FilterGroup,
    subOrderDirection?: OrderDirection,
    subOrderColumn?: string,
    functionType?: FunctionType,
  ) {
    super(columnPath, subFilters, subOrderDirection, subOrderColumn);
    this.aggregationType = aggregationType;
    this.functionType = functionType;
  }

  protected override prepareSerializableObject(
    serializableObject: SerializedObject,
  ): SerializedObject {
    serializableObject = super.prepareSerializableObject(serializableObject);
    serializableObject['aggregationType'] = this.aggregationType;
    if (typeof this.functionType !== 'undefined') {
      serializableObject['functionType'] = this.functionType;
    }
    return serializableObject;
  }
}
