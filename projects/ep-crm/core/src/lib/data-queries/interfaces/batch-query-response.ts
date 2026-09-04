import { BaseResponse } from '../../http/contracts/base-response';
import { ResponseStatus } from '../../http/contracts/response-status';

export interface BatchQueryResponse extends BaseResponse {
  responseStatus: ResponseStatus;
  queryResults: object[];
  hasErrors: boolean;
}
