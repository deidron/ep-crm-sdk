import { EntityColumnValue } from './entity';

export interface LookupValue {
  value: string;
  displayValue: string;

  primaryImageValue?: string;
}

export function isLookupValue(value: unknown): value is LookupValue {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Partial<LookupValue>;
  return typeof candidate.value === 'string' && typeof candidate.displayValue === 'string';
}

export function getLookupDisplayValue(value: EntityColumnValue): string {
  return isLookupValue(value) ? value.displayValue : '';
}
