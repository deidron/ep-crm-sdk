import {
  PlatformUrlProvider,
  ServiceRoute,
  ServiceRoutes,
  ServiceScope,
  ServiceUrlBuilder,
} from '@ep-crm/core';
import { PlatformGlobalUrlBuilder } from './platform-global-url-builder';

export class WorkspaceUrlProvider extends PlatformUrlProvider {
  private builders: Record<ServiceScope, ServiceUrlBuilder> = {
    application: new PlatformGlobalUrlBuilder('loaderBaseUrl'),
    workspace: new PlatformGlobalUrlBuilder('workspaceBaseUrl'),
  };

  constructor(private readonly routes: ServiceRoutes) {
    super();
  }

  override resolve(alias: string): string {
    const route: ServiceRoute | undefined = this.routes[alias];
    if (!route) {
      throw new Error(`The "${alias}" route is not described in the service list.`);
    }
    if (route.embedded === false) {
      throw new Error(
        `The "${alias}" service is not meant to be called from a platform page: ` +
          'the session is already opened by the platform.',
      );
    }
    return this.builders[route.scope].buildUrl(route.path);
  }
}
