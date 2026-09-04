import { HttpContext, HttpContextToken } from '@angular/common/http';

export const SESSION_PROBE = new HttpContextToken<boolean>(() => false);

export function sessionProbeContext(): HttpContext {
  return new HttpContext().set(SESSION_PROBE, true);
}
