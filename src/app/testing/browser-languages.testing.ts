export function useBrowserLanguages(languages: readonly string[]): void {
  Object.defineProperty(navigator, 'languages', {
    value: languages,
    configurable: true,
  });
  Object.defineProperty(navigator, 'language', {
    value: languages[0] ?? '',
    configurable: true,
  });
}
