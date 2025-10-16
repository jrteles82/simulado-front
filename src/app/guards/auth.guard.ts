import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const requireAuthGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.current) return true;

  if (state?.url) {
    try { localStorage.setItem('post_login_redirect', state.url); } catch {}
  }

  router.navigate(['/'], { state: { loginRequired: true } });
  return false;
};
