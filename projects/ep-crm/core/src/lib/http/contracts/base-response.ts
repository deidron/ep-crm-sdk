import { ErrorInfo } from './error-info';

export interface BaseResponse {
  success: boolean;

  errorInfo?: ErrorInfo | null;
}
