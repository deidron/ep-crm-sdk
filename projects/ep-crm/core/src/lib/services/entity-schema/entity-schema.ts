import { LocalizableString } from '../../localization/localizable-string';
import { DataValueType } from '../../types/data-value-type';

export interface EntitySchemaColumn {
  uId: string;

  name: string;

  caption: LocalizableString;

  description: LocalizableString;

  dataValueType: DataValueType;

  referenceSchemaName: string | null;

  referenceSchemaUId: string | null;

  isRequired: boolean;

  isInherited: boolean;

  isOverride: boolean;

  isVirtual: boolean;

  isValueCloneable: boolean;

  isMultilineText: boolean;

  isSimpleLookup: boolean;

  isCascade: boolean;

  isIndexed: boolean;

  isWeakReference: boolean;

  usageType: number;

  status: number;
}

export interface EntitySchemaColumns {
  Items: Record<string, EntitySchemaColumn>;
}

export interface EntitySchema {
  uId: string;

  name: string;

  caption: LocalizableString;

  columns?: EntitySchemaColumns;

  parentUId?: string;

  administratedByOperations?: boolean;

  administratedByColumns?: boolean;

  administratedByRecords?: boolean;

  useMasterRecordRights?: boolean;

  masterRecordSchemaName?: string;

  useUnifiedPageSchema?: boolean;

  isVirtual?: boolean;

  isDBView?: boolean;

  isTrackChangesInDB?: boolean;
}

export function getSchemaColumns(schema: EntitySchema | null | undefined): EntitySchemaColumn[] {
  return Object.values(schema?.columns?.Items ?? {});
}

export function findSchemaColumn(
  schema: EntitySchema | null | undefined,
  name: string,
): EntitySchemaColumn | null {
  return getSchemaColumns(schema).find((column) => column.name === name) ?? null;
}
