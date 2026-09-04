import { encodeDate, parseDate, toDate, toLocalISOString } from './date-utils';

function expectLocalParts(
  date: Date | null,
  [year, month, day, hours, minutes, seconds, milliseconds]: number[],
): void {
  expect(date).not.toBeNull();
  expect([
    date!.getFullYear(),
    date!.getMonth() + 1,
    date!.getDate(),
    date!.getHours(),
    date!.getMinutes(),
    date!.getSeconds(),
    date!.getMilliseconds(),
  ]).toEqual([year, month, day, hours, minutes, seconds, milliseconds]);
}

describe('parseDate', () => {
  it('parses a value without a time zone as local time', () => {
    expectLocalParts(parseDate('2019-06-05T15:43:29.234'), [2019, 6, 5, 15, 43, 29, 234]);
  });

  it('truncates fractions of a second to milliseconds', () => {
    expectLocalParts(parseDate('2019-06-05T15:43:29.2340000'), [2019, 6, 5, 15, 43, 29, 234]);
  });

  it('pads a short fractional part to three digits', () => {
    expectLocalParts(parseDate('2019-06-05T15:43:29.5'), [2019, 6, 5, 15, 43, 29, 500]);
  });

  it('parses a value without fractions of a second', () => {
    expectLocalParts(parseDate('2019-06-05T15:43:29'), [2019, 6, 5, 15, 43, 29, 0]);
  });

  it('converts a value marked as UTC', () => {
    expect(parseDate('2019-06-05T15:43:29.234Z')!.toISOString()).toBe('2019-06-05T15:43:29.234Z');
  });

  it('converts a value with an explicit offset', () => {
    expect(parseDate('2019-06-05T15:43:29.234-06:30')!.toISOString()).toBe(
      '2019-06-05T22:13:29.234Z',
    );
  });

  it('treats a date without time as local midnight', () => {
    expectLocalParts(parseDate('2019-06-05'), [2019, 6, 5, 0, 0, 0, 0]);
  });

  it('returns null for an empty value', () => {
    expect(parseDate(null)).toBeNull();
    expect(parseDate(undefined)).toBeNull();
    expect(parseDate('')).toBeNull();
  });

  it('throws a TypeError instead of returning an Invalid Date', () => {
    expect(() => parseDate('nonsense')).toThrow(TypeError);
  });
});

describe('toLocalISOString', () => {
  it('does not convert the value to UTC', () => {
    expect(toLocalISOString(new Date(2018, 1, 20, 15, 10, 30))).toBe('2018-02-20T15:10:30.000');
  });

  it('assembles a pre-1970 date from components', () => {
    expect(toLocalISOString(new Date(1950, 0, 2, 3, 4, 5, 6))).toBe('1950-01-02T03:04:05.006');
  });

  it('rejects an invalid date', () => {
    expect(() => toLocalISOString(new Date('nonsense'))).toThrow(TypeError);
  });
});

describe('encodeDate', () => {
  it('wraps the value in quotes — this is exactly how DataService expects a parameter', () => {
    expect(encodeDate(new Date(2018, 1, 20, 15, 10, 30))).toBe('"2018-02-20T15:10:30.000"');
  });
});

describe('toDate', () => {
  it('returns the given Date unchanged', () => {
    const date: Date = new Date(2020, 0, 1);
    expect(toDate(date)).toBe(date);
  });

  it('treats a date without time as local midnight rather than UTC', () => {
    expectLocalParts(toDate('2020-03-15'), [2020, 3, 15, 0, 0, 0, 0]);
  });

  it('accepts a timestamp', () => {
    expect(toDate(0).getTime()).toBe(0);
  });

  it('throws a TypeError on an unparsable value', () => {
    expect(() => toDate({})).toThrow(TypeError);
  });
});
