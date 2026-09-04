import { SerializedObject } from '../../serialization/serialized-object';
import { BaseSerializableObject } from '../../serialization/base-serializable-object';
import { Query } from '../../http/contracts/query';

import { QueryOperationType } from '../enums/query-operation-type';

export abstract class BaseQuery<T> extends BaseSerializableObject implements Query<T> {
  abstract serviceUrl: string;

  abstract operationType: QueryOperationType;

  abstract readonly dtoTypeName: string;

  isBatchable: boolean = false;

  constructor(protected readonly rootSchemaName: string) {
    super();
  }

  parseResponse(response: T, callback?: (response: T) => void): void {
    if (typeof callback !== 'undefined') {
      callback(response);
    }
  }

  protected prepareSerializableObject(serializableObject: SerializedObject): SerializedObject {
    serializableObject['rootSchemaName'] = this.rootSchemaName;
    serializableObject['operationType'] = this.operationType;
    return serializableObject;
  }
}
