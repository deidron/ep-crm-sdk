import { Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import ruRU from '../../locale/ru-RU.json';

export const translationProviders: Provider[] = [
  provideTranslateService({ fallbackLang: 'ru-RU' }),
];

export function useRussianTranslations(): void {
  const translate: TranslateService = TestBed.inject(TranslateService);
  translate.setTranslation('ru-RU', ruRU);
  translate.use('ru-RU');
}
