import { SerializedObject } from '../../serialization/serialized-object';
import { BaseSerializableObject } from '../../serialization/base-serializable-object';
import { Query } from '../../http/contracts/query';

export abstract class BaseSchemaRequest<T> extends BaseSerializableObject implements Query<T> {
  abstract serviceUrl: string;

  uId?: string;

  packageUId?: string;

  parseResponse(response: T, callback?: (response: T) => void): void {
    if (typeof callback !== 'undefined') {
      callback(response);
    }
  }

  protected prepareSerializableObject(serializableObject: SerializedObject): SerializedObject {
    serializableObject['uId'] = this.uId;
    serializableObject['packageUId'] = this.packageUId;
    return serializableObject;
  }
}
