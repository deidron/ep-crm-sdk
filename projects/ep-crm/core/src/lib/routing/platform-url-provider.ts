export abstract class PlatformUrlProvider {
  abstract resolve(alias: string): string;
}
