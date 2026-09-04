export interface DateTimeFormatSettings {
  dateSeparator: string;
  shortDatePattern: string;
  shortTimePattern: string;
  firstDayOfWeek: number;
  amDesignator: string;
  pmDesignator: string;
}

export interface CultureSettings {
  sysCultureId: string;
  sysCultureName: string;
  decimalSeparator: string;
  thousandSeparator: string;

  dateTimeFormat: DateTimeFormatSettings | null;
}
