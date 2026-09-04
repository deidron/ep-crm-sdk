import { SerializedObject } from '../../serialization/serialized-object';
import { BaseFilter } from './base-filter';
import { BaseSerializableObject } from '../../serialization/base-serializable-object';
import { FilterType } from '../enums/filter-type';
import { LogicalOperatorType } from '../enums/logical-operator-type';

export class FilterGroup extends BaseSerializableObject {
  collection: Map<string, BaseFilter> = new Map<string, BaseFilter>();

  logicalOperation: LogicalOperatorType = LogicalOperatorType.AND;

  isEnabled: boolean = true;

  filterType: FilterType = FilterType.FILTER_GROUP;

  key: string = '';

  rootSchemaName: string = '';

  addFilter(key: string, filter: BaseFilter): BaseFilter {
    this.collection.set(key, filter);
    return filter;
  }

  getIsCompleted(recursive: boolean = false): boolean {
    if (!recursive) {
      return true;
    }
    return this.filters().every((filter) => filter.getIsCompleted());
  }

  isEmpty(): boolean {
    return this.collection.size === 0;
  }

  filters(): BaseFilter[] {
    return [...this.collection.values()];
  }

  protected prepareSerializableObject(serializableObject: SerializedObject): SerializedObject {
    const items: SerializedObject = {};
    this.collection.forEach((value, key) => {
      if (!value.getIsCompleted()) {
        return;
      }
      items[key] = this.getSerializableProperty(value);
    });
    serializableObject['items'] = items;
    serializableObject['logicalOperation'] = this.logicalOperation;
    serializableObject['isEnabled'] = this.isEnabled;
    serializableObject['filterType'] = this.filterType;
    if (this.rootSchemaName !== '') {
      serializableObject['rootSchemaName'] = this.rootSchemaName;
    }
    if (this.key !== '') {
      serializableObject['key'] = this.key;
    }
    return serializableObject;
  }
}
