import { BaseQueryResponse } from '../../http/contracts/base-query-response';
import { EntitySchema } from './entity-schema';

export interface EntitySchemaResponse extends BaseQueryResponse {
  schema: EntitySchema;
}
