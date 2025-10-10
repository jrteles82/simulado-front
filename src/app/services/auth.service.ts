import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const TOKEN_KEY = 'auth_token';

export type AuthUser = { sub: string; email: string; name?: string; picture?: string; exp?: number };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user$ = new BehaviorSubject<AuthUser | null>(null);
  user$ = this._user$.asObservable();

  constructor() { this.restoreFromStorage(); }

  get token(): string | null { return localStorage.getItem(TOKEN_KEY); }

  loginWithGoogle(startUrl: string) {
    window.location.href = startUrl; // environment.auth.googleStart
  }

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
    this.hydrateFromToken(token);
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    this._user$.next(null);
  }

  private restoreFromStorage() {
    const t = this.token;
    if (t) this.hydrateFromToken(t);
  }

  private hydrateFromToken(token: string) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1])) as AuthUser;
      // exp (segundos) -> inválido se expirado
      if (payload?.exp && payload.exp * 1000 < Date.now()) {
        this.logout();
        return;
      }
      this._user$.next(payload);
    } catch {
      this.logout();
    }
  }
}
