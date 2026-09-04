import { SerializedObject } from '../../serialization/serialized-object';
import { BaseFilter } from './base-filter';
import { FilterType } from '../enums/filter-type';
import { ComparisonType } from '../enums/comparison-type';
import { FilterGroup } from './filter-group';

export class ExistsFilter extends BaseFilter {
  override filterType: FilterType = FilterType.EXISTS;

  protected override _comparisonType: ComparisonType = ComparisonType.EXISTS;

  subFilters: FilterGroup = new FilterGroup();

  override isAggregative: boolean = true;

  override getIsCompleted(): boolean {
    return true;
  }

  protected override prepareSerializableObject(
    serializableObject: SerializedObject,
  ): SerializedObject {
    serializableObject = super.prepareSerializableObject(serializableObject);
    serializableObject['subFilters'] = this.getSerializableProperty(this.subFilters);
    return serializableObject;
  }
}
