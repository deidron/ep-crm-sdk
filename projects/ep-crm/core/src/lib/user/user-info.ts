import { CultureSettings } from './culture-settings';

export interface UserInfo {
  id: string;
  contactId: string;
  contactName: string;
  cultureInfo: CultureSettings;
  defCultureInfo: CultureSettings;
  isSSP: boolean;
  timeZoneId: string;
  timeZoneOffsetHours: number;
  photoId: string;
}
