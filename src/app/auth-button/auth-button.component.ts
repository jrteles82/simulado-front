import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-auth-button',
  imports: [NgIf, AsyncPipe, RouterLink],
  templateUrl: './auth-button.component.html',
})
export class AuthButtonComponent {
  auth = inject(AuthService);
  private router = inject(Router);
  @Input() variant: 'desktop' | 'mobile' = 'desktop';
  @Output() loggedOut = new EventEmitter<void>();
  @Output() navigated = new EventEmitter<void>();

  login() {
    let url = environment.auth.googleStart;
    // garante barra inicial se vier relativo
    if (!/^https?:\/\//i.test(url) && !url.startsWith('/')) url = '/' + url;
    window.location.href = url;
  }

  logout() {
    this.auth.logout();
    this.loggedOut.emit();
    this.router.navigateByUrl('/');
  }

  handleNav() {
    this.navigated.emit();
  }
}
