import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const canActivateAdmin: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const u = auth.current;
  if (u && u.role === 'ADMIN') return true;
  router.navigateByUrl('/');
  return false;
};
