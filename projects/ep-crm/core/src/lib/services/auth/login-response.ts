import { ExceptionDetail } from './exception-detail';
import { LoginResponseCode } from './login-response-code';
import { ResponseBase } from './response-base';

export interface LoginResponse extends ResponseBase {
  Code: LoginResponseCode;

  RedirectUrl: string;

  PasswordChangeUrl: string;

  Exception?: ExceptionDetail;
}
