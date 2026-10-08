import { Routes } from '@angular/router';
import { adminGuard } from './core/auth/admin.guard';
import { authGuard } from './core/auth/auth.guard';
import { guestGuard } from './core/auth/guest.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'admin/dashboard' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login-page').then((m) => m.LoginPage),
  },
  {
    path: '403',
    loadComponent: () =>
      import('./features/errors/forbidden-page').then((m) => m.ForbiddenPage),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layouts/admin/admin-layout').then((m) => m.AdminLayout),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/dashboard/dashboard-page').then(
            (m) => m.DashboardPage,
          ),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/errors/not-found-page').then((m) => m.NotFoundPage),
  },
];
