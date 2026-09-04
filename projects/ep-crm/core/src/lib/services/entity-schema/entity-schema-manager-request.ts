import { EntitySchemaManagerResponse } from './entity-schema-manager-response';
import { BaseSchemaRequest } from './base-schema-request';

export class EntitySchemaManagerRequest extends BaseSchemaRequest<EntitySchemaManagerResponse> {
  serviceUrl: string = 'entitySchemaManager';
}
