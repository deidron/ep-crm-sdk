import { getLocalizedString } from './localizable-string';

describe('getLocalizedString', () => {
  it('returns a plain string as is', () => {
    expect(getLocalizedString('Контакт', 'ru-RU')).toBe('Контакт');
  });

  it('picks the translation for the given culture', () => {
    expect(getLocalizedString({ 'ru-RU': 'Контакт', 'en-US': 'Contact' }, 'ru-RU')).toBe('Контакт');
  });

  it('falls back to the default culture', () => {
    expect(getLocalizedString({ 'en-US': 'Contact' }, 'ru-RU')).toBe('Contact');
  });

  it('takes any available translation when neither the requested nor the fallback one exists', () => {
    expect(getLocalizedString({ 'de-DE': 'Kontakt' }, 'ru-RU')).toBe('Kontakt');
  });

  it('returns an empty string for a missing value', () => {
    expect(getLocalizedString(null, 'ru-RU')).toBe('');
    expect(getLocalizedString(undefined, 'ru-RU')).toBe('');
  });
});
