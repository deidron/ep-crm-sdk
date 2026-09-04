import { PLATFORM_NAMES, PlatformName } from '@ep-crm/core';

export interface PlatformGlobal {
  loaderBaseUrl?: string;
  workspaceBaseUrl?: string;
}

export function getPlatformGlobal(): PlatformGlobal | undefined {
  const scope = globalThis as unknown as Record<string, PlatformGlobal | undefined>;
  for (const name of PLATFORM_NAMES) {
    const candidate: PlatformGlobal | undefined = scope[name];
    if (candidate) {
      return candidate;
    }
  }
  return undefined;
}

export function getPlatformGlobalName(): PlatformName | undefined {
  const scope = globalThis as unknown as Record<string, PlatformGlobal | undefined>;
  return PLATFORM_NAMES.find((name) => Boolean(scope[name]));
}
