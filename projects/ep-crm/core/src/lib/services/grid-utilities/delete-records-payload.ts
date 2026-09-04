import { BaseResponse } from '../../http/contracts/base-response';

export interface DeleteRecordsPayload {
  rootSchema: string;
  primaryColumnValues: string[];
  parameters: string;
  filtersConfig?: string | null;
}

export interface DeleteRecordsResponse extends BaseResponse {
  rowsAffected?: number;
}
