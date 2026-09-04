import { SerializedObject } from '../../serialization/serialized-object';
import { BaseSerializableObject } from '../../serialization/base-serializable-object';
import { FilterType } from '../enums/filter-type';
import { BaseExpression } from './base-expression';
import { ComparisonType } from '../enums/comparison-type';

export class BaseFilter extends BaseSerializableObject {
  filterType: FilterType = FilterType.NONE;

  leftExpression: BaseExpression | null = null;

  protected _comparisonType: ComparisonType = ComparisonType.EQUAL;

  isAggregative: boolean = false;

  isEnabled: boolean = true;

  trimDateTimeParameterToDate: boolean = false;

  leftExpressionCaption: string = '';

  referenceSchemaName: string = '';

  key: string = '';

  get comparisonType() {
    return this._comparisonType;
  }

  set comparisonType(value: ComparisonType) {
    this._comparisonType = value;
  }

  getIsCompleted(): boolean {
    return this.leftExpression !== null;
  }

  protected prepareSerializableObject(serializableObject: SerializedObject): SerializedObject {
    serializableObject['filterType'] = this.filterType;
    serializableObject['comparisonType'] = this.comparisonType;
    serializableObject['isEnabled'] = this.isEnabled;
    serializableObject['trimDateTimeParameterToDate'] = this.trimDateTimeParameterToDate;
    serializableObject['leftExpression'] = this.getSerializableProperty(this.leftExpression);
    return serializableObject;
  }
}
