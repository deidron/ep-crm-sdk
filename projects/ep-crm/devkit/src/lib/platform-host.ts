import { inject, Service } from '@angular/core';
import { getPlatformGlobal, getPlatformGlobalName } from './platform-global';
import { PLATFORM_NAME } from './platform-name';
import { PlatformName } from '@ep-crm/core';

@Service()
export class PlatformHost {
  private readonly providedName: PlatformName | null = inject(PLATFORM_NAME);

  readonly isEmbedded: boolean = Boolean(getPlatformGlobal()?.workspaceBaseUrl);

  readonly name: PlatformName | null = getPlatformGlobalName() ?? this.providedName;

  get isStandalone(): boolean {
    return !this.isEmbedded;
  }
}
