import { BaseResponse } from '../http/contracts/base-response';
import { UserInfo } from './user-info';

export interface UserInfoResponse extends BaseResponse {
  userInfo: UserInfo;
}
