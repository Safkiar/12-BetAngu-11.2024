import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const UnauthGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isLoggedIn = await authService.isLoggedInAsync();
  if (!isLoggedIn) {
    return true;
  } else {
    return router.parseUrl('/home');
  }
};
