import { BaseResponse } from '../../http/contracts/base-response';

export interface RunProcessResponse extends BaseResponse {
  processId?: string;
  processStatus?: number;
  resultParameterValues?: Record<string, unknown>;
  executionData?: unknown;
}
