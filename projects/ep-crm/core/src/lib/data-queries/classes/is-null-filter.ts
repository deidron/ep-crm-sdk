import { SerializedObject } from '../../serialization/serialized-object';
import { BaseFilter } from './base-filter';
import { FilterType } from '../enums/filter-type';
import { ComparisonType } from '../enums/comparison-type';

export class IsNullFilter extends BaseFilter {
  override filterType: FilterType = FilterType.IS_NULL;

  protected override _comparisonType: ComparisonType = ComparisonType.IS_NULL;

  private isNull: boolean = true;

  override get comparisonType(): ComparisonType {
    return this._comparisonType;
  }

  override set comparisonType(value: ComparisonType) {
    this._comparisonType = value;
    this.isNull = this._comparisonType === ComparisonType.IS_NULL;
  }

  protected override prepareSerializableObject(
    serializableObject: SerializedObject,
  ): SerializedObject {
    serializableObject = super.prepareSerializableObject(serializableObject);
    serializableObject['isNull'] = this.isNull;
    return serializableObject;
  }
}
