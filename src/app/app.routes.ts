import { Routes } from '@angular/router';
import { authorizationMatchGuard } from '@app/authorization/authorization-match-guard';
import { loginGuard } from '@app/authorization/login-guard';
import { ErrorPage } from '@app/errors';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    canMatch: [authorizationMatchGuard],
    loadChildren: () => import('./dashboard/dashboard.routes').then((m) => m.dashboardRoutes),
  },
  {
    path: 'login',
    canActivateChild: [loginGuard],
    loadChildren: () =>
      import('./authorization/authorization.routes').then((m) => m.authorizationRoutes),
  },

  {
    path: 'unauthorized',
    component: ErrorPage,
    data: { titleKey: 'errorAccessDeniedTitle', textKey: 'errorAccessDeniedText' },
  },

  {
    path: '**',
    component: ErrorPage,
    data: { titleKey: 'errorNotFoundTitle', textKey: 'errorNotFoundText' },
  },
];
