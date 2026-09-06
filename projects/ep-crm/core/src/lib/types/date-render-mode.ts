import { DataValueType } from './data-value-type';

export type DateRenderMode = 'date' | 'time' | 'datetime';

const renderModes: ReadonlyMap<DataValueType, DateRenderMode> = new Map<
  DataValueType,
  DateRenderMode
>([
  [DataValueType.DATE, 'date'],
  [DataValueType.TIME, 'time'],
  [DataValueType.DATE_TIME, 'datetime'],
]);

export function dateRenderMode(dataValueType: DataValueType): DateRenderMode | null {
  return renderModes.get(dataValueType) ?? null;
}
