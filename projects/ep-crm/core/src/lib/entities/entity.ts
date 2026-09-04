import { DataValueType } from '../types/data-value-type';

export interface EntityColumnConfig {
  dataValueType: DataValueType;
  isLookup?: boolean;
  precision?: number;
  referenceSchemaName?: string;
  primaryImageColumnName?: string;
}

export type EntityColumnsConfig = Record<string, EntityColumnConfig>;

export type RawEntityColumnValue = string | number | boolean | object | null;

export type RawEntity = Record<string, RawEntityColumnValue>;

export type EntityColumnValue = RawEntityColumnValue | Date;

export type Entity = Record<string, EntityColumnValue>;
