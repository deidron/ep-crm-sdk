import { SerializedObject } from '../../serialization/serialized-object';
import { BaseSerializableObject } from '../../serialization/base-serializable-object';
import { encodeDate, toDate } from '../../utils/date-utils';
import { DataValueType } from '../../types/data-value-type';
import { ParameterValueType } from '../types/parameter-value-type';

export class Parameter extends BaseSerializableObject {
  private _dataValueType: DataValueType = DataValueType.TEXT;

  private _value: ParameterValueType = null;

  get value() {
    return this._value;
  }

  set value(value: ParameterValueType) {
    this._value = value;
  }

  get dataValueType() {
    return this._dataValueType;
  }

  set dataValueType(value: DataValueType) {
    this._dataValueType = value;
  }

  constructor(dataValueType?: DataValueType, value?: ParameterValueType) {
    super();
    if (typeof dataValueType !== 'undefined') {
      this.dataValueType = dataValueType;
    }
    if (typeof value !== 'undefined') {
      this.value = value;
    }
  }

  protected prepareSerializableObject(serializableObject: SerializedObject): SerializedObject {
    serializableObject['dataValueType'] = this.dataValueType;
    serializableObject['value'] = this.isDateValue() ? encodeDate(toDate(this.value)) : this.value;
    return serializableObject;
  }

  private isDateValue(): boolean {
    return (
      this.value instanceof Date ||
      this.dataValueType === DataValueType.DATE ||
      this.dataValueType === DataValueType.DATE_TIME
    );
  }
}
