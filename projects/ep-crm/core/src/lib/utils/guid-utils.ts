export const EMPTY_GUID: string = '00000000-0000-0000-0000-000000000000';

const GUID_PATTERN: RegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isGuid(value: string | null | undefined): value is string {
  return typeof value === 'string' && GUID_PATTERN.test(value);
}

export function isEmptyGuid(value: string | null | undefined): boolean {
  return !isGuid(value) || value.toLowerCase() === EMPTY_GUID;
}
