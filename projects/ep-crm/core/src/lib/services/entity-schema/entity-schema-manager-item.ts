import { BaseSchemaManagerItem } from './base-schema-manager-item';

export interface EntitySchemaManagerItem extends BaseSchemaManagerItem {
  isVirtual: boolean;
}
