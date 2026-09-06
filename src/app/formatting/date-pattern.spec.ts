import { formatDate } from '@angular/common';
import { toAngularDatePattern, usesAmPmDesignator } from './date-pattern';

describe('toAngularDatePattern', () => {
  it('translates the AM/PM designator the platform reports for en-US', () => {
    expect(toAngularDatePattern('h:mm tt')).toBe('h:mm a');
  });

  it('leaves a pattern that means the same in both syntaxes alone', () => {
    expect(toAngularDatePattern('M/d/yyyy')).toBe('M/d/yyyy');
    expect(toAngularDatePattern('dd.MM.yyyy')).toBe('dd.MM.yyyy');
    expect(toAngularDatePattern('HH:mm')).toBe('HH:mm');
  });

  it('keeps the day of the month but translates the day name', () => {
    expect(toAngularDatePattern('d MMMM')).toBe('d MMMM');
    expect(toAngularDatePattern('dd.MM')).toBe('dd.MM');
    expect(toAngularDatePattern('ddd, dd.MM')).toBe('EEE, dd.MM');
    expect(toAngularDatePattern('dddd, MMMM d')).toBe('EEEE, MMMM d');
  });

  it('translates fractional seconds and the UTC offset', () => {
    expect(toAngularDatePattern('HH:mm:ss.fff')).toBe('HH:mm:ss.SSS');
    expect(toAngularDatePattern('HH:mm:ss.FF')).toBe('HH:mm:ss.SS');
    expect(toAngularDatePattern('HH:mm:ssK')).toBe('HH:mm:ssZZZZZ');
    expect(toAngularDatePattern('HH:mm zz')).toBe('HH:mm Z');
    expect(toAngularDatePattern('HH:mm zzz')).toBe('HH:mm ZZZZZ');
  });

  it('translates the era', () => {
    expect(toAngularDatePattern('yyyy gg')).toBe('yyyy G');
  });

  it('copies a quoted literal as is', () => {
    expect(toAngularDatePattern("dd.MM.yyyy 'at' HH:mm")).toBe("dd.MM.yyyy 'at' HH:mm");
    expect(toAngularDatePattern("dd 'tt' HH:mm tt")).toBe("dd 'tt' HH:mm a");
  });

  it('turns a backslash escape into a quoted literal', () => {
    expect(toAngularDatePattern('dd\\.MM')).toBe("dd'.'MM");
    expect(toAngularDatePattern('HH\\hmm')).toBe("HH'h'mm");
  });

  it('renders through formatDate without leaking pattern letters', () => {
    const value = new Date(2019, 6, 15, 20, 2);
    expect(formatDate(value, toAngularDatePattern('M/d/yyyy h:mm tt'), 'en-US')).toBe(
      '7/15/2019 8:02 PM',
    );
  });
});

describe('usesAmPmDesignator', () => {
  it('finds the designator the pattern renders', () => {
    expect(usesAmPmDesignator('h:mm a')).toBe(true);
    expect(usesAmPmDesignator('M/d/yyyy h:mm a')).toBe(true);
  });

  it('ignores a pattern that renders none', () => {
    expect(usesAmPmDesignator('HH:mm')).toBe(false);
    expect(usesAmPmDesignator('dd.MM.yyyy')).toBe(false);
  });

  it('ignores the letter inside a literal', () => {
    expect(usesAmPmDesignator("HH:mm 'am'")).toBe(false);
  });
});
