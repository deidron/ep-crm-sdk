import { PlatformName } from '@ep-crm/core';
import { environment as base } from './environment.development';

export const environment = {
  ...base,
  platformName: PlatformName.Terrasoft,
};
