import { toCldrDatePattern, usesAmPmDesignator } from './date-pattern';

describe('toCldrDatePattern', () => {
  it('translates the AM/PM designator the platform reports for en-US', () => {
    expect(toCldrDatePattern('h:mm tt')).toBe('h:mm a');
  });

  it('leaves a pattern that means the same in both syntaxes alone', () => {
    expect(toCldrDatePattern('M/d/yyyy')).toBe('M/d/yyyy');
    expect(toCldrDatePattern('dd.MM.yyyy')).toBe('dd.MM.yyyy');
    expect(toCldrDatePattern('HH:mm')).toBe('HH:mm');
  });

  it('keeps the day of the month but translates the day name', () => {
    expect(toCldrDatePattern('d MMMM')).toBe('d MMMM');
    expect(toCldrDatePattern('dd.MM')).toBe('dd.MM');
    expect(toCldrDatePattern('ddd, dd.MM')).toBe('EEE, dd.MM');
    expect(toCldrDatePattern('dddd, MMMM d')).toBe('EEEE, MMMM d');
  });

  it('translates fractional seconds and the UTC offset', () => {
    expect(toCldrDatePattern('HH:mm:ss.fff')).toBe('HH:mm:ss.SSS');
    expect(toCldrDatePattern('HH:mm:ss.FF')).toBe('HH:mm:ss.SS');
    expect(toCldrDatePattern('HH:mm:ssK')).toBe('HH:mm:ssZZZZZ');
    expect(toCldrDatePattern('HH:mm zz')).toBe('HH:mm Z');
    expect(toCldrDatePattern('HH:mm zzz')).toBe('HH:mm ZZZZZ');
  });

  it('translates the era', () => {
    expect(toCldrDatePattern('yyyy gg')).toBe('yyyy G');
  });

  it('copies a quoted literal as is', () => {
    expect(toCldrDatePattern("dd.MM.yyyy 'at' HH:mm")).toBe("dd.MM.yyyy 'at' HH:mm");
    expect(toCldrDatePattern("dd 'tt' HH:mm tt")).toBe("dd 'tt' HH:mm a");
  });

  it('turns a backslash escape into a quoted literal', () => {
    expect(toCldrDatePattern('dd\\.MM')).toBe("dd'.'MM");
    expect(toCldrDatePattern('HH\\hmm')).toBe("HH'h'mm");
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
