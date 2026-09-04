import { InjectionToken } from '@angular/core';
import { PlatformName } from '@ep-crm/core';

export const PLATFORM_NAME = new InjectionToken<PlatformName | null>('PLATFORM_NAME', {
  providedIn: 'root',
  factory: () => null,
});
