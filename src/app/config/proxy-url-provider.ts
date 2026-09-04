import { PlatformUrlProvider } from '@ep-crm/core';

export class ProxyUrlProvider extends PlatformUrlProvider {
  override resolve(alias: string): string {
    return `/crm/${alias}`;
  }
}
