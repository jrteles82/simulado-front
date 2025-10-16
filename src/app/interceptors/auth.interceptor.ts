import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token;
  let userId = auth.current?.sub;

  if (token && !userId) {
    try {
      const [, payload] = token.split('.');
      if (payload) {
        const decoded = JSON.parse(atob(payload));
        if (decoded?.sub) userId = decoded.sub;
      }
    } catch {
      userId = undefined;
    }
  }

  const headers: Record<string, string> = {};

  if (token) headers.Authorization = `Bearer ${token}`;
  if (userId) headers['x-user-id'] = userId;
  else if (!token && environment.devUserId) headers['x-user-id'] = environment.devUserId;

  if (Object.keys(headers).length) {
    req = req.clone({ setHeaders: headers });
  }

  return next(req);
};
