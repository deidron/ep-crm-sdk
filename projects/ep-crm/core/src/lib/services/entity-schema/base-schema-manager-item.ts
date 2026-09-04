import { LocalizableString } from '../../localization/localizable-string';
import { BaseManagerItem } from './base-manager-item';

export interface BaseSchemaManagerItem extends BaseManagerItem {
  uId: string;

  packageUId: string;

  name: string;

  caption: LocalizableString;

  parentUId: string;

  extendParent: boolean;
}
