import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/api/auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    const role = authService.getUserRole();

    if (role === 'USUARIO') {
      authService.logout();
      return false;
    }

    const isGoingToDraws = state.url.includes('/draws');

    if (role === 'SORTEADOR' && !isGoingToDraws) {
      router.navigate(['/draws']);
      return false;
    }
    return true;
  }

  router.navigate(['/login']);
  return false;
};
