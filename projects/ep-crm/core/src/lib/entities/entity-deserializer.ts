import { DataValueType } from '../types/data-value-type';
import {
  Entity,
  EntityColumnsConfig,
  EntityColumnValue,
  RawEntity,
  RawEntityColumnValue,
} from './entity';
import { parseDate } from '../utils/date-utils';

type ColumnsDataValueTypesMap = Record<string, DataValueType>;

function getDataValueTypes(columnsConfig: EntityColumnsConfig): ColumnsDataValueTypesMap {
  return Object.keys(columnsConfig).reduce(
    (dataValueTypes: ColumnsDataValueTypesMap, columnAlias: string) => {
      dataValueTypes[columnAlias] = columnsConfig[columnAlias].dataValueType;
      return dataValueTypes;
    },
    {} as ColumnsDataValueTypesMap,
  );
}

function parseColumnValue(
  value: RawEntityColumnValue,
  dataValueType: DataValueType,
): EntityColumnValue {
  switch (dataValueType) {
    case DataValueType.DATE:
    case DataValueType.TIME:
    case DataValueType.DATE_TIME:
      return typeof value === 'string' ? parseDate(value) : value;
    default:
      return value;
  }
}

function parseRawEntity(rawEntity: RawEntity, dataValueTypes: ColumnsDataValueTypesMap): Entity {
  const entity: Entity = {};
  Object.keys(rawEntity).forEach((columnAlias: string) => {
    const value: RawEntityColumnValue = rawEntity[columnAlias];
    const dataValueType: DataValueType | undefined = dataValueTypes[columnAlias];
    entity[columnAlias] =
      typeof dataValueType === 'undefined' ? value : parseColumnValue(value, dataValueType);
  });
  return entity;
}

export function deserializeEntity(
  columnsConfig: EntityColumnsConfig,
  rawEntity: RawEntity,
): Entity {
  return parseRawEntity(rawEntity, getDataValueTypes(columnsConfig));
}

export function deserializeEntities(
  columnsConfig: EntityColumnsConfig,
  rawEntities: RawEntity[],
): Entity[] {
  if (!columnsConfig || !rawEntities) {
    return rawEntities ?? [];
  }
  const dataValueTypes: ColumnsDataValueTypesMap = getDataValueTypes(columnsConfig);
  return rawEntities.map((rawEntity: RawEntity) => parseRawEntity(rawEntity, dataValueTypes));
}
