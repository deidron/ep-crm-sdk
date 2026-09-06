import { TestBed } from '@angular/core/testing';
import { DataValueType, DateTimeFormatSettings } from '@ep-crm/core';
import { UserContextService } from '@ep-crm/devkit';
import { CultureDateService, dateRenderMode } from './culture-date';

const enUs: DateTimeFormatSettings = {
  dateSeparator: '/',
  shortDatePattern: 'M/d/yyyy',
  shortTimePattern: 'h:mm tt',
  firstDayOfWeek: 0,
  amDesignator: 'AM',
  pmDesignator: 'PM',
};

const ruRu: DateTimeFormatSettings = {
  dateSeparator: '.',
  shortDatePattern: 'dd.MM.yyyy',
  shortTimePattern: 'H:mm',
  firstDayOfWeek: 1,
  amDesignator: '',
  pmDesignator: '',
};

const translatedDesignators: DateTimeFormatSettings = {
  ...enUs,
  amDesignator: 'ДП',
  pmDesignator: 'ПП',
};

function configure(dateTimeFormat: DateTimeFormatSettings | null): CultureDateService {
  TestBed.configureTestingModule({
    providers: [
      CultureDateService,
      {
        provide: UserContextService,
        useValue: { userInfo: () => ({ cultureInfo: { dateTimeFormat } }) },
      },
    ],
  });
  return TestBed.inject(CultureDateService);
}

describe('dateRenderMode', () => {
  it('maps each of the platform types that carry a moment in time', () => {
    expect(dateRenderMode(DataValueType.DATE)).toBe('date');
    expect(dateRenderMode(DataValueType.TIME)).toBe('time');
    expect(dateRenderMode(DataValueType.DATE_TIME)).toBe('datetime');
  });

  it('leaves the types that carry none unmapped', () => {
    expect(dateRenderMode(DataValueType.TEXT)).toBeNull();
    expect(dateRenderMode(DataValueType.LOOKUP)).toBeNull();
  });
});

describe('CultureDateService', () => {
  it('renders a time on its own, without the date half', () => {
    const dates: CultureDateService = configure(ruRu);
    expect(dates.render(new Date(2019, 6, 15, 8, 2), 'time')).toBe('8:02');
  });

  it('renders each mode with the pattern of the user culture', () => {
    const dates: CultureDateService = configure(ruRu);
    const value: Date = new Date(2019, 6, 15, 8, 2);
    expect(dates.render(value, 'date')).toBe('15.07.2019');
    expect(dates.render(value, 'datetime')).toBe('15.07.2019 8:02');
  });

  it('spells the AM/PM designator the way the platform culture reports it', () => {
    const dates: CultureDateService = configure(translatedDesignators);
    expect(dates.render(new Date(2019, 6, 15, 8, 2), 'time')).toBe('8:02 ДП');
    expect(dates.render(new Date(2019, 6, 15, 20, 2), 'time')).toBe('8:02 ПП');
  });

  it('keeps the designator the platform culture agrees with', () => {
    const dates: CultureDateService = configure(enUs);
    expect(dates.render(new Date(2019, 6, 15, 20, 2), 'datetime')).toBe('7/15/2019 8:02 PM');
  });

  it('keeps what the pattern rendered when the culture reports no designator', () => {
    const dates: CultureDateService = configure({ ...ruRu, shortTimePattern: 'h:mm tt' });
    expect(dates.render(new Date(2019, 6, 15, 20, 2), 'time')).toBe('8:02 PM');
  });

  it('falls back to its own patterns when the platform reports no format', () => {
    const dates: CultureDateService = configure(null);
    const value: Date = new Date(2019, 6, 15, 8, 2);
    expect(dates.render(value, 'date')).toBe('15.07.2019');
    expect(dates.render(value, 'time')).toBe('08:02');
  });

  it('renders anything that is not a date as nothing', () => {
    const dates: CultureDateService = configure(enUs);
    expect(dates.render(null, 'date')).toBe('');
    expect(dates.render('2019-07-15', 'date')).toBe('');
  });
});
