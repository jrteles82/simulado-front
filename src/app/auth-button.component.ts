import { Component, inject } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { AuthService } from './services/auth.service';
import { environment } from '../environments/environment';

@Component({
  standalone: true,
  selector: 'app-auth-button',
  imports: [NgIf, AsyncPipe],
  template: `
    <ng-container *ngIf="auth.user$ | async as user; else out">
      <button class="btn btn-outline-dark btn-sm" (click)="logout()">
        <img *ngIf="user.picture" [src]="user.picture" alt="avatar"
             width="20" height="20" style="border-radius:50%;margin-right:.4rem">
        {{ user.name || user.email }} (sair)
      </button>
    </ng-container>
    <ng-template #out>
      <button class="btn btn-outline-primary btn-sm" (click)="login()">Entrar com Google</button>
    </ng-template>
  `
})
export class AuthButtonComponent {
  auth = inject(AuthService);
  login()  { window.location.href = environment.auth.googleStart; }
  logout() { this.auth.logout(); }
}
