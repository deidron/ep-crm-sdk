import { getLookupDisplayValue, isLookupValue } from './lookup-value';

describe('isLookupValue', () => {
  it('recognises a filled lookup', () => {
    const value = {
      value: 'eeac42ee-65b6-df11-831a-001d60e938c6',
      displayValue: 'Male',
      primaryImageValue: '',
    };
    expect(isLookupValue(value)).toBe(true);
  });

  it('does not take an empty value for a lookup', () => {
    expect(isLookupValue('')).toBe(false);
    expect(isLookupValue(null)).toBe(false);
    expect(isLookupValue(undefined)).toBe(false);
  });

  it('does not take a foreign object for a lookup', () => {
    expect(isLookupValue({ value: 'no caption' })).toBe(false);
    expect(isLookupValue(new Date())).toBe(false);
  });
});

describe('getLookupDisplayValue', () => {
  it('returns the caption of the related record', () => {
    expect(getLookupDisplayValue({ value: '1', displayValue: 'Employee' })).toBe('Employee');
  });

  it('returns an empty string for an empty lookup', () => {
    expect(getLookupDisplayValue('')).toBe('');
    expect(getLookupDisplayValue(null)).toBe('');
  });
});
