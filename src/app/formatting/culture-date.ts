import { formatDate } from '@angular/common';
import { computed, inject, Service, Signal } from '@angular/core';
import { DateTimeFormatSettings } from '@ep-crm/core';
import { UserContextService } from '@ep-crm/devkit';

const defaultDatePattern: string = 'dd.MM.yyyy';

const defaultTimePattern: string = 'HH:mm';

const formattingLocale: string = 'en-US';

@Service()
export class CultureDateService {
  private readonly userContext = inject(UserContextService);

  readonly datePattern: Signal<string> = computed(
    () => this.format()?.shortDatePattern || defaultDatePattern,
  );

  readonly timePattern: Signal<string> = computed(
    () => this.format()?.shortTimePattern || defaultTimePattern,
  );

  readonly dateTimePattern: Signal<string> = computed(
    () => `${this.datePattern()} ${this.timePattern()}`,
  );

  pattern(withTime: boolean): string {
    return withTime ? this.dateTimePattern() : this.datePattern();
  }

  render(value: unknown, withTime: boolean): string {
    if (!(value instanceof Date)) {
      return '';
    }
    return formatDate(value, this.pattern(withTime), formattingLocale);
  }

  private format(): DateTimeFormatSettings | null {
    return this.userContext.userInfo()?.cultureInfo.dateTimeFormat ?? null;
  }
}
