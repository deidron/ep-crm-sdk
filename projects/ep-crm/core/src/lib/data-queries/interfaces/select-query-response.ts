import { BaseQueryResponse } from '../../http/contracts/base-query-response';
import { Entity, EntityColumnsConfig } from '../../entities/entity';

export interface SelectQueryResponse extends BaseQueryResponse {
  rowConfig: EntityColumnsConfig;

  rows: Entity[];

  notFoundColumns?: unknown[];
}
