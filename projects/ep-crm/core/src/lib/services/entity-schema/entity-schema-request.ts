import { EntitySchemaResponse } from './entity-schema-response';
import { BaseSchemaRequest } from './base-schema-request';

export class EntitySchemaRequest extends BaseSchemaRequest<EntitySchemaResponse> {
  serviceUrl: string = 'entitySchema';
}
