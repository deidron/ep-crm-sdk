import { BaseResponse } from '../../http/contracts/base-response';

export interface SchemaOperationRightLevelResponse extends BaseResponse {
  GetSchemaOperationRightLevelResult: number;
}

export interface EntityRights {
  canRead: boolean;
  canAppend: boolean;
  canEdit: boolean;
  canDelete: boolean;
}
