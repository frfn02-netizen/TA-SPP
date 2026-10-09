import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const siswaGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  if (auth.isAdmin()) {
    return router.createUrlTree(['/admin/dashboard']);
  }

  if (!auth.isStudent()) {
    return router.createUrlTree(['/403']);
  }

  return true;
};
