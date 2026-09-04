import { SerializedObject } from '../../serialization/serialized-object';
import { BaseFilter } from './base-filter';
import { FilterType } from '../enums/filter-type';
import { BaseExpression } from './base-expression';
import { ParameterExpression } from './parameter-expression';
import { ParameterValueType } from '../types/parameter-value-type';

export class CompareFilter extends BaseFilter {
  override filterType: FilterType = FilterType.COMPARE;

  rightExpression: BaseExpression | null = null;

  override getIsCompleted(): boolean {
    if (!super.getIsCompleted() || this.rightExpression === null) {
      return false;
    }
    if (this.rightExpression instanceof ParameterExpression) {
      const value: ParameterValueType = this.rightExpression.parameterValue;
      return value !== null && value !== undefined;
    }
    return true;
  }

  protected override prepareSerializableObject(
    serializableObject: SerializedObject,
  ): SerializedObject {
    serializableObject = super.prepareSerializableObject(serializableObject);
    serializableObject['rightExpression'] = this.getSerializableProperty(this.rightExpression);
    return serializableObject;
  }
}
