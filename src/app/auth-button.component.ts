import { Component, inject } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { AuthService } from './services/auth.service';
import { environment } from '../environments/environment';

@Component({
  standalone: true,
  selector: 'app-auth-button',
  imports: [NgIf, AsyncPipe],
  template: `
    <ng-container *ngIf="auth.user$ | async as user; else loggedOut">
      <div class="d-flex align-items-center gap-2">
        <img *ngIf="user.picture" [src]="user.picture" alt="avatar"
             width="24" height="24" style="border-radius:50%">
        <span class="small">{{ user.name || user.email }}</span>
        <button class="btn btn-outline-dark btn-sm" (click)="logout()">Sair</button>
      </div>
    </ng-container>

    <ng-template #loggedOut>
      <button class="btn btn-outline-primary btn-sm" (click)="login()">Entrar com Google</button>
    </ng-template>
  `
})
export class AuthButtonComponent {
  auth = inject(AuthService);

  login() {
    let url = environment.auth.googleStart;
    // garante barra inicial se vier relativo
    if (!/^https?:\/\//i.test(url) && !url.startsWith('/')) url = '/' + url;
    window.location.href = url;
  }

  logout() { this.auth.logout(); }
}
