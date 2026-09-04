export type ServiceScope = 'workspace' | 'application';

export interface ServiceRoute {
  path: string;

  scope: ServiceScope;

  embedded?: boolean;
}

export type ServiceRoutes = Record<string, ServiceRoute>;
