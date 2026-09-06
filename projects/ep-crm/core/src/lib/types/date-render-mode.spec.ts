import { DataValueType } from './data-value-type';
import { dateRenderMode } from './date-render-mode';

describe('dateRenderMode', () => {
  it('maps each of the platform types that carry a moment in time', () => {
    expect(dateRenderMode(DataValueType.DATE)).toBe('date');
    expect(dateRenderMode(DataValueType.TIME)).toBe('time');
    expect(dateRenderMode(DataValueType.DATE_TIME)).toBe('datetime');
  });

  it('leaves the types that carry none unmapped', () => {
    expect(dateRenderMode(DataValueType.TEXT)).toBeNull();
    expect(dateRenderMode(DataValueType.LOOKUP)).toBeNull();
    expect(dateRenderMode(DataValueType.GUID)).toBeNull();
  });
});
