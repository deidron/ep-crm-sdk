import { SerializedObject } from '../../serialization/serialized-object';
import { BaseFilter } from './base-filter';
import { BaseExpression } from './base-expression';
import { ParameterExpression } from './parameter-expression';
import { FilterType } from '../enums/filter-type';
import { ComparisonType } from '../enums/comparison-type';
import { ParameterValueType } from '../types/parameter-value-type';

export class BetweenFilter extends BaseFilter {
  override filterType: FilterType = FilterType.BETWEEN;

  protected override _comparisonType: ComparisonType = ComparisonType.BETWEEN;

  private _rightLessExpression: BaseExpression | null = null;

  private _rightGreaterExpression: BaseExpression | null = null;

  get rightLessExpression(): BaseExpression | null {
    return this._rightLessExpression;
  }

  set rightLessExpression(expression: BaseExpression | null) {
    if (expression instanceof ParameterExpression) {
      expression.parentFilter = this;
    }
    this._rightLessExpression = expression;
  }

  get rightGreaterExpression(): BaseExpression | null {
    return this._rightGreaterExpression;
  }

  set rightGreaterExpression(expression: BaseExpression | null) {
    if (expression instanceof ParameterExpression) {
      expression.parentFilter = this;
    }
    this._rightGreaterExpression = expression;
  }

  override getIsCompleted(): boolean {
    return (
      super.getIsCompleted() &&
      this.isBoundCompleted(this.rightLessExpression) &&
      this.isBoundCompleted(this.rightGreaterExpression)
    );
  }

  protected override prepareSerializableObject(
    serializableObject: SerializedObject,
  ): SerializedObject {
    serializableObject = super.prepareSerializableObject(serializableObject);
    serializableObject['rightLessExpression'] = this.getSerializableProperty(
      this.rightLessExpression,
    );
    serializableObject['rightGreaterExpression'] = this.getSerializableProperty(
      this.rightGreaterExpression,
    );
    return serializableObject;
  }

  private isBoundCompleted(expression: BaseExpression | null): boolean {
    if (expression === null) {
      return false;
    }
    if (expression instanceof ParameterExpression) {
      const value: ParameterValueType = expression.parameterValue;
      return value !== null && value !== undefined && value !== '';
    }
    return true;
  }
}
