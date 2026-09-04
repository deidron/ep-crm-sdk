import { EMPTY_GUID, isEmptyGuid, isGuid } from './guid-utils';

describe('isGuid', () => {
  it('accepts an identifier in any case', () => {
    expect(isGuid('3c7e0e12-9f1f-4a1c-8f2f-000000000001')).toBe(true);
    expect(isGuid('3C7E0E12-9F1F-4A1C-8F2F-000000000001')).toBe(true);
  });

  it('rejects anything that does not look like an identifier', () => {
    expect(isGuid('not an identifier')).toBe(false);
    expect(isGuid('3c7e0e12-9f1f-4a1c-8f2f')).toBe(false);
    expect(isGuid(null)).toBe(false);
    expect(isGuid(undefined)).toBe(false);
  });
});

describe('isEmptyGuid', () => {
  it('treats the zero identifier as empty', () => {
    expect(isEmptyGuid(EMPTY_GUID)).toBe(true);
    expect(isEmptyGuid(EMPTY_GUID.toUpperCase())).toBe(true);
  });

  it('treats a missing value as empty', () => {
    expect(isEmptyGuid(null)).toBe(true);
    expect(isEmptyGuid(undefined)).toBe(true);
  });

  it('treats a string that does not look like an identifier as empty', () => {
    expect(isEmptyGuid('not an identifier')).toBe(true);
  });

  it('does not treat a filled identifier as empty', () => {
    expect(isEmptyGuid('3c7e0e12-9f1f-4a1c-8f2f-000000000001')).toBe(false);
  });
});
