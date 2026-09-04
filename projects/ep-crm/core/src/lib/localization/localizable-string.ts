export type LocalizableString = string | Record<string, string>;

const DEFAULT_CULTURE: string = 'en-US';

export function getLocalizedString(
  value: LocalizableString | null | undefined,
  culture: string,
  defaultCulture: string = DEFAULT_CULTURE,
): string {
  if (!value) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  return value[culture] ?? value[defaultCulture] ?? Object.values(value)[0] ?? '';
}
