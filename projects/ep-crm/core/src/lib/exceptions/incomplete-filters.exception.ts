export class IncompleteFiltersException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IncompleteFiltersException';
  }
}
