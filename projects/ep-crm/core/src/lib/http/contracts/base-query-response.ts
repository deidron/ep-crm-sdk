import { BaseResponse } from './base-response';
import { ResponseStatus } from './response-status';

export interface BaseQueryResponse extends BaseResponse {
  responseStatus?: ResponseStatus;
  queryId?: string;
  rowsAffected: number;
  nextPrcElReady: boolean;
}
