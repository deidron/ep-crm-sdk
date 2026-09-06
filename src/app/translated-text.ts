import { TranslateService } from '@ngx-translate/core';

export function translatedText(translate: TranslateService, key: string): string {
  const text: unknown = translate.instant(key);
  return typeof text === 'string' ? text : key;
}
