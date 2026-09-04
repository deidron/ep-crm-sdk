import { SerializedObject } from '../../serialization/serialized-object';
import { BaseSerializableObject } from '../../serialization/base-serializable-object';
import { Query } from '../../http/contracts/query';
import { SchemaOperationRightLevelResponse } from './schema-operation-right-level-response';

export class SchemaOperationRightLevelRequest
  extends BaseSerializableObject
  implements Query<SchemaOperationRightLevelResponse>
{
  serviceUrl: string = 'rights';

  constructor(private readonly schemaName: string) {
    super();
  }

  parseResponse(
    response: SchemaOperationRightLevelResponse,
    callback?: (response: SchemaOperationRightLevelResponse) => void,
  ): void {
    if (typeof callback !== 'undefined') {
      callback(response);
    }
  }

  protected prepareSerializableObject(serializableObject: SerializedObject): SerializedObject {
    serializableObject['schemaName'] = this.schemaName;
    return serializableObject;
  }
}
