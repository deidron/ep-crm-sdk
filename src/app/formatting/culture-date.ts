import { formatDate } from '@angular/common';
import { computed, inject, Service, Signal } from '@angular/core';
import { DataValueType, DateTimeFormatSettings } from '@ep-crm/core';
import { UserContextService } from '@ep-crm/devkit';
import { toAngularDatePattern, usesAmPmDesignator } from '@app/formatting/date-pattern';

const defaultDatePattern: string = 'dd.MM.yyyy';

const defaultTimePattern: string = 'HH:mm';

const formattingLocale: string = 'en-US';

const localeAmDesignator: string = 'AM';

const localePmDesignator: string = 'PM';

export type DateRenderMode = 'date' | 'time' | 'datetime';

const renderModes: ReadonlyMap<DataValueType, DateRenderMode> = new Map<
  DataValueType,
  DateRenderMode
>([
  [DataValueType.DATE, 'date'],
  [DataValueType.TIME, 'time'],
  [DataValueType.DATE_TIME, 'datetime'],
]);

export function dateRenderMode(dataValueType: DataValueType): DateRenderMode | null {
  return renderModes.get(dataValueType) ?? null;
}

@Service()
export class CultureDateService {
  private readonly userContext = inject(UserContextService);

  readonly datePattern: Signal<string> = computed(() =>
    toAngularDatePattern(this.format()?.shortDatePattern || defaultDatePattern),
  );

  readonly timePattern: Signal<string> = computed(() =>
    toAngularDatePattern(this.format()?.shortTimePattern || defaultTimePattern),
  );

  readonly dateTimePattern: Signal<string> = computed(
    () => `${this.datePattern()} ${this.timePattern()}`,
  );

  pattern(mode: DateRenderMode): string {
    switch (mode) {
      case 'date':
        return this.datePattern();
      case 'time':
        return this.timePattern();
      case 'datetime':
        return this.dateTimePattern();
    }
  }

  render(value: unknown, mode: DateRenderMode): string {
    if (!(value instanceof Date)) {
      return '';
    }
    const pattern: string = this.pattern(mode);
    return this.localizeDesignator(formatDate(value, pattern, formattingLocale), pattern, value);
  }

  private localizeDesignator(text: string, pattern: string, value: Date): string {
    const format: DateTimeFormatSettings | null = this.format();
    if (!format || !usesAmPmDesignator(pattern)) {
      return text;
    }
    const beforeNoon: boolean = value.getHours() < 12;
    const designator: string = beforeNoon ? format.amDesignator : format.pmDesignator;
    if (!designator) {
      return text;
    }
    return text.replace(beforeNoon ? localeAmDesignator : localePmDesignator, designator);
  }

  private format(): DateTimeFormatSettings | null {
    return this.userContext.userInfo()?.cultureInfo.dateTimeFormat ?? null;
  }
}
