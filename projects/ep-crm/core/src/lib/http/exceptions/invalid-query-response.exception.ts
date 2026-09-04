import { BaseResponse } from '../contracts/base-response';
import { Query } from '../contracts/query';
import { ResponseStatus } from '../contracts/response-status';

interface FailedResponse extends BaseResponse {
  responseStatus?: ResponseStatus;
}

export class InvalidQueryResponseException extends Error {
  readonly serviceUrl: string;

  readonly response: BaseResponse;

  constructor(query: Query<unknown>, response: BaseResponse) {
    super(InvalidQueryResponseException.buildMessage(query, response));
    this.name = 'InvalidQueryResponseException';
    this.serviceUrl = query.serviceUrl;
    this.response = response;
  }

  private static buildMessage(query: Query<unknown>, response: BaseResponse): string {
    const failed: FailedResponse = response;
    const status: ResponseStatus | undefined = failed?.responseStatus;
    const errorInfo = failed?.errorInfo;
    let details: string = 'the service reported no reason';
    if (status?.Message) {
      details = status.ErrorCode ? `${status.Message} [${status.ErrorCode}]` : status.Message;
    } else if (errorInfo?.message) {
      details = errorInfo.errorCode
        ? `${errorInfo.message} [${errorInfo.errorCode}]`
        : errorInfo.message;
    }
    return `The "${query.serviceUrl}" query failed: ${details}.\n${query.serialize()}`;
  }
}
