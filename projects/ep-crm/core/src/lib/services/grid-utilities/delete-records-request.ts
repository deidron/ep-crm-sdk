import { SerializedObject } from '../../serialization/serialized-object';
import { BaseSerializableObject } from '../../serialization/base-serializable-object';
import { Query } from '../../http/contracts/query';
import { DeleteRecordsPayload, DeleteRecordsResponse } from './delete-records-payload';

export class DeleteRecordsRequest
  extends BaseSerializableObject
  implements Query<DeleteRecordsResponse>
{
  serviceUrl: string = 'deleteRecords';

  constructor(private readonly payload: DeleteRecordsPayload) {
    super();
    if (!payload.rootSchema) {
      throw new Error('Deletion requires rootSchema to be specified.');
    }
    if (!payload.primaryColumnValues?.length) {
      throw new Error('The list of records to delete is empty.');
    }
  }

  parseResponse(
    response: DeleteRecordsResponse,
    callback?: (response: DeleteRecordsResponse) => void,
  ): void {
    if (typeof callback !== 'undefined') {
      callback(response);
    }
  }

  protected prepareSerializableObject(serializableObject: SerializedObject): SerializedObject {
    serializableObject['rootSchema'] = this.payload.rootSchema;
    serializableObject['primaryColumnValues'] = this.payload.primaryColumnValues;
    serializableObject['parameters'] = this.payload.parameters;
    if (typeof this.payload.filtersConfig !== 'undefined') {
      serializableObject['filtersConfig'] = this.payload.filtersConfig;
    }
    return serializableObject;
  }
}
