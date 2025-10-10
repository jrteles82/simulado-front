import { Component, inject } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { AuthService } from './services/auth.service';
import { environment } from '../environments/environment';

@Component({
  standalone: true,
  selector: 'app-auth-button',
  imports: [NgIf, AsyncPipe],
  template: `
    <ng-container *ngIf="auth.user$ | async; else loggedOut">
      <button (click)="logout()">Sair / Logout</button>
    </ng-container>
    <ng-template #loggedOut>
      <button (click)="login()">Entrar com Google</button>
    </ng-template>
  `
})
export class AuthButtonComponent {
  auth = inject(AuthService);
  login()  { this.auth.loginWithGoogle(environment.auth.googleStart); }
  logout() { this.auth.logout(); }
}
