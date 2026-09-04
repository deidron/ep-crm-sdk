import { inject } from '@angular/core';
import { CanActivateChildFn, Router, UrlTree } from '@angular/router';
import { AuthorizationService } from '@app/authorization/authorization';

export const loginGuard: CanActivateChildFn = (): true | UrlTree => {
  const router: Router = inject(Router);
  return inject(AuthorizationService).isAuthenticated() ? router.parseUrl('/dashboard') : true;
};
