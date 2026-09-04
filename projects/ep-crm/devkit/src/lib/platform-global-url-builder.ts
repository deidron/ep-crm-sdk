import { PLATFORM_NAMES, ServiceUrlBuilder } from '@ep-crm/core';
import { getPlatformGlobal, PlatformGlobal } from './platform-global';

export class PlatformGlobalUrlBuilder extends ServiceUrlBuilder {
  constructor(private readonly source: keyof PlatformGlobal) {
    super();
  }

  protected override get baseUrl(): string {
    const baseUrl: string | undefined = getPlatformGlobal()?.[this.source];
    if (!baseUrl) {
      throw new Error(
        `The platform global (${PLATFORM_NAMES.join(' or ')}) with ${this.source} is not available. ` +
          'An address can only be built inside a platform page.',
      );
    }
    return baseUrl;
  }
}
