import { SerializedObject } from '../../serialization/serialized-object';
import { BaseFilter } from './base-filter';
import { FilterType } from '../enums/filter-type';
import { ComparisonType } from '../enums/comparison-type';
import { BaseExpression } from './base-expression';
import { ParameterExpression } from './parameter-expression';

export class InFilter extends BaseFilter {
  override filterType: FilterType = FilterType.IN;

  protected override _comparisonType: ComparisonType = ComparisonType.EQUAL;

  private _rightExpressions: BaseExpression[] = new Array<BaseExpression>();

  get rightExpressions(): BaseExpression[] {
    return this._rightExpressions;
  }

  set rightExpressions(rightExpressions: BaseExpression[]) {
    rightExpressions.forEach((expression) => {
      if (expression instanceof ParameterExpression) {
        expression.parentFilter = this;
      }
    });
    this._rightExpressions = rightExpressions;
  }

  protected override prepareSerializableObject(
    serializableObject: SerializedObject,
  ): SerializedObject {
    serializableObject = super.prepareSerializableObject(serializableObject);
    const serializedExpressions: (SerializedObject | undefined)[] = [];
    const rightExpressions: BaseExpression[] = this.rightExpressions;
    rightExpressions.forEach((expression) => {
      serializedExpressions.push(this.getSerializableProperty(expression));
    });
    serializableObject['rightExpressions'] = serializedExpressions;
    return serializableObject;
  }
}
