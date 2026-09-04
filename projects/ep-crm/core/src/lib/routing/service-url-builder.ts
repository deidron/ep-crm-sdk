export abstract class ServiceUrlBuilder {
  protected abstract get baseUrl(): string;
  buildUrl(path: string): string {
    return `${this.baseUrl.replace(/\/+$/, '')}/${path}`;
  }
}
