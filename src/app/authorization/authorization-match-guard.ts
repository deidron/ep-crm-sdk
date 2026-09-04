import { inject } from '@angular/core';
import { CanMatchFn, Navigation, Router, UrlTree } from '@angular/router';
import { AuthorizationService } from '@app/authorization/authorization';

export const authorizationMatchGuard: CanMatchFn = (): true | UrlTree => {
  const router: Router = inject(Router);
  const navigation: Navigation | null = router.getCurrentNavigation();
  const returnUrl: string = navigation ? router.serializeUrl(navigation.extractedUrl) : '/';
  return inject(AuthorizationService).checkAuthorization(returnUrl);
};
