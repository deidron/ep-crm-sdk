import { SerializedObject } from '../../serialization/serialized-object';
import { ExpressionType } from '../enums/expression-type';
import { OrderDirection } from '../enums/order-direction';
import { BaseExpression } from './base-expression';
import { FilterGroup } from './filter-group';

export class SubQueryExpression extends BaseExpression {
  override expressionType: ExpressionType = ExpressionType.SUBQUERY;

  columnPath: string;

  subFilters?: FilterGroup;

  subOrderDirection?: OrderDirection;

  subOrderColumn?: string;

  constructor(
    columnPath: string,
    subFilters?: FilterGroup,
    subOrderDirection?: OrderDirection,
    subOrderColumn?: string,
  ) {
    super();
    this.columnPath = columnPath;
    this.subFilters = subFilters;
    this.subOrderDirection = subOrderDirection;
    this.subOrderColumn = subOrderColumn;
  }

  protected override prepareSerializableObject(
    serializableObject: SerializedObject,
  ): SerializedObject {
    serializableObject = super.prepareSerializableObject(serializableObject);
    serializableObject['columnPath'] = this.columnPath;
    if (this.subFilters) {
      serializableObject['subFilters'] = this.getSerializableProperty(this.subFilters);
    }
    if (typeof this.subOrderDirection !== 'undefined') {
      serializableObject['subOrderDirection'] = this.subOrderDirection;
    }
    if (typeof this.subOrderColumn !== 'undefined') {
      serializableObject['subOrderColumn'] = this.subOrderColumn;
    }
    return serializableObject;
  }
}
