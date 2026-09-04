export class UnsupportedTypeException extends Error {
  readonly typeName: string;

  readonly value: unknown;

  constructor(typeName: string, value: unknown) {
    super(`Unsupported ${typeName} value: ${String(value)}.`);
    this.name = 'UnsupportedTypeException';
    this.typeName = typeName;
    this.value = value;
  }
}
