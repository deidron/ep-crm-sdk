import { SerializedObject } from '../../serialization/serialized-object';
import { BaseFilterableQuery } from './base-filterable-query';
import { QueryOperationType } from '../enums/query-operation-type';
import { BaseQueryResponse } from '../../http/contracts/base-query-response';

export class DeleteQuery extends BaseFilterableQuery<BaseQueryResponse> {
  serviceUrl: string = 'delete';

  override operationType: QueryOperationType = QueryOperationType.DELETE;

  readonly dtoTypeName: string = 'DeleteQuery';

  protected override prepareSerializableObject(
    serializableObject: SerializedObject,
  ): SerializedObject {
    this.validateFilters();
    return super.prepareSerializableObject(serializableObject);
  }
}
