import { SerializedObject } from '../../serialization/serialized-object';
import { ExpressionType } from '../enums/expression-type';
import { BaseSerializableObject } from '../../serialization/base-serializable-object';

export class BaseExpression extends BaseSerializableObject {
  expressionType: ExpressionType = ExpressionType.SCHEMA_COLUMN;

  protected prepareSerializableObject(serializableObject: SerializedObject): SerializedObject {
    serializableObject['expressionType'] = this.expressionType;
    return serializableObject;
  }
}
