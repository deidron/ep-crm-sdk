import { HttpErrorResponse } from '@angular/common/http';
import { ResponseStatus } from '@ep-crm/core';

interface ErrorResponseBody {
  responseStatus?: Partial<ResponseStatus>;
}

export class InvalidResponseException extends Error {
  readonly status: number | null;

  readonly response: unknown;

  constructor(response: unknown) {
    super(InvalidResponseException.buildMessage(response));
    this.name = 'InvalidResponseException';
    this.response = response;
    this.status = response instanceof HttpErrorResponse ? response.status : null;
  }

  private static buildMessage(response: unknown): string {
    if (response instanceof HttpErrorResponse) {
      const body = response.error as ErrorResponseBody | null;
      const serverMessage: string | undefined = body?.responseStatus?.Message;
      const errorCode: string | undefined = body?.responseStatus?.ErrorCode;
      const details: string = serverMessage ?? response.message;
      return errorCode ? `${details} [${errorCode}]` : details;
    }
    return response instanceof Error ? response.message : String(response);
  }
}
