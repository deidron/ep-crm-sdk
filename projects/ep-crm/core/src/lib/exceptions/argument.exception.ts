export class ArgumentException extends Error {
  readonly argumentName: string;

  constructor(argumentName: string, message: string) {
    super(message);
    this.name = 'ArgumentException';
    this.argumentName = argumentName;
  }
}

export class ArgumentNullOrEmptyException extends ArgumentException {
  constructor(argumentName: string) {
    super(argumentName, `The "${argumentName}" argument is not set.`);
    this.name = 'ArgumentNullOrEmptyException';
  }
}

export class ArgumentOutOfRangeException extends ArgumentException {
  constructor(argumentName: string, message?: string) {
    super(argumentName, message ?? `The "${argumentName}" argument is out of the allowed range.`);
    this.name = 'ArgumentOutOfRangeException';
  }
}
