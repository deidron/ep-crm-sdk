import { PlatformName } from '../types/platform-name';

export function dataContractOf(platformName: PlatformName): string {
  return `${platformName}.Nui.ServiceModel.DataContract`;
}
