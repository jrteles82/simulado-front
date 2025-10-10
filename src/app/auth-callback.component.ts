import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  standalone: true,
  selector: 'app-auth-callback',
  template: `<div>Finalizando login...</div>`
})
export class AuthCallbackComponent implements OnInit {
  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    const m = window.location.hash.match(/token=([^&]+)/);
    if (m) this.auth.setToken(decodeURIComponent(m[1]));
    this.router.navigateByUrl('/');
  }
}
