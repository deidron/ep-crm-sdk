import { BaseQueryResponse } from '../../http/contracts/base-query-response';

export interface InsertQueryResponse extends BaseQueryResponse {
  id: string;
}
