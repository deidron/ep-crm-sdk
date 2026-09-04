export interface AuthToken {
  UserName: string;

  UserPassword: string;

  WorkspaceName?: string;

  TimeZoneOffset?: number;

  Language?: string;

  NewUserPassword?: string;

  ConfirmUserPassword?: string;

  PasswordRecoveryMode?: string;

  ProviderName?: string;

  ClaimList?: Map<string, object>;
}
