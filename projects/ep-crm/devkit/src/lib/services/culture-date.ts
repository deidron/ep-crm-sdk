import { formatDate } from '@angular/common';
import { computed, inject, Service, Signal } from '@angular/core';
import { DateRenderMode, DateTimeFormatSettings } from '@ep-crm/core';
import { toCldrDatePattern, usesAmPmDesignator } from '@ep-crm/core';
import { UserContextService } from '../user-context';

const defaultDatePattern: string = 'dd.MM.yyyy';

const defaultTimePattern: string = 'HH:mm';

const fallbackLocale: string = 'en-US';

function hasLocaleData(locale: string): boolean {
  try {
    formatDate(0, 'y', locale);
    return true;
  } catch {
    return false;
  }
}

@Service()
export class CultureDateService {
  private readonly userContext = inject(UserContextService);

  readonly locale: Signal<string> = computed(() => {
    const culture: string = this.userContext.currentCulture();
    return culture && hasLocaleData(culture) ? culture : fallbackLocale;
  });

  readonly datePattern: Signal<string> = computed(() =>
    toCldrDatePattern(this.format()?.shortDatePattern || defaultDatePattern),
  );

  readonly timePattern: Signal<string> = computed(() =>
    toCldrDatePattern(this.format()?.shortTimePattern || defaultTimePattern),
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
    const locale: string = this.locale();
    const pattern: string = this.pattern(mode);
    const text: string = formatDate(value, pattern, locale);
    const designator: string = this.designator(value);
    if (!designator || !usesAmPmDesignator(pattern)) {
      return text;
    }
    return text.replace(formatDate(value, 'a', locale), designator);
  }

  private designator(value: Date): string {
    const format: DateTimeFormatSettings | null = this.format();
    if (!format) {
      return '';
    }
    return value.getHours() < 12 ? format.amDesignator : format.pmDesignator;
  }

  private format(): DateTimeFormatSettings | null {
    return this.userContext.userInfo()?.cultureInfo.dateTimeFormat ?? null;
  }
}
