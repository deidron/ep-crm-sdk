function isHistoricalDate(date: Date): boolean {
  return date.getFullYear() < 1970;
}

function pad(value: number, length: number = 2): string {
  return String(value).padStart(length, '0');
}

function getISOStringForPre1970Date(date: Date): string {
  const datePart: string = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const timePart: string = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  return `${datePart}T${timePart}.${pad(date.getMilliseconds(), 3)}`;
}

function getISOStringWithOffset(date: Date): string {
  const timeZoneOffset: number = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timeZoneOffset).toISOString().slice(0, -1);
}

export function toLocalISOString(date: Date): string {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new TypeError('A valid Date instance is expected.');
  }
  return isHistoricalDate(date) ? getISOStringForPre1970Date(date) : getISOStringWithOffset(date);
}

export function encodeDate(date: Date): string {
  return `"${toLocalISOString(date)}"`;
}

export function toDate(value: unknown): Date {
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === 'string') {
    const dateOnly: RegExpMatchArray | null = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateOnly) {
      return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]));
    }
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const date: Date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }
  throw new TypeError(`Unable to convert ${JSON.stringify(value)} into a date.`);
}

function throwInvalidDateString(value: string): never {
  throw new TypeError(`String "${value}" is not a valid serialized date.`);
}

function parseMilliseconds(fraction: string | undefined): number {
  if (!fraction) {
    return 0;
  }
  return Number(fraction.padEnd(3, '0').slice(0, 3));
}

export function parseDate(value: string | null | undefined): Date | null {
  if (!value) {
    return null;
  }
  const [datePart, timePart] = value.split('T');
  if (!timePart) {
    return toDate(datePart);
  }
  const hasTimeZone: boolean =
    timePart.endsWith('Z') || timePart.includes('+') || timePart.includes('-');
  if (hasTimeZone) {
    const milliseconds: number = Date.parse(value);
    if (Number.isNaN(milliseconds)) {
      throwInvalidDateString(value);
    }
    return new Date(milliseconds);
  }
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes, secondsWithMilliseconds] = timePart.split(':');
  const [seconds, milliseconds] = (secondsWithMilliseconds ?? '0').split('.');
  const date: Date = new Date(
    year,
    month - 1,
    day,
    Number(hours),
    Number(minutes),
    Number(seconds),
    parseMilliseconds(milliseconds),
  );
  if (Number.isNaN(date.getTime())) {
    throwInvalidDateString(value);
  }
  return date;
}
