export interface ExceptionDetail {
  HelpLink: string;

  InnerException: ExceptionDetail;

  Message: string;

  StackTrace: string;

  Type: string;
}
