import { SerializedObject } from '../../serialization/serialized-object';
import { BaseExpression } from './base-expression';

export class ColumnExpression extends BaseExpression {
  columnPath: string = '';

  constructor(columnPath?: string) {
    super();
    if (typeof columnPath !== 'undefined') {
      this.columnPath = columnPath;
    }
  }

  protected override prepareSerializableObject(
    serializableObject: SerializedObject,
  ): SerializedObject {
    serializableObject = super.prepareSerializableObject(serializableObject);
    serializableObject['columnPath'] = this.columnPath;
    return serializableObject;
  }
}
