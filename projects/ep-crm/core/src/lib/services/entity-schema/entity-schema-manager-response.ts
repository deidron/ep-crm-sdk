import { BaseQueryResponse } from '../../http/contracts/base-query-response';
import { EntitySchemaManagerItem } from './entity-schema-manager-item';

export interface EntitySchemaManagerResponse extends BaseQueryResponse {
  collection: EntitySchemaManagerItem[];
}
