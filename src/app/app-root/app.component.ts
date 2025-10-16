import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.handleAuthCallback();
  }

  private handleAuthCallback() {
    const m = window.location.hash.match(/token=([^&]+)/);
    if (!m) return;
    const token = decodeURIComponent(m[1]);
    this.auth.setToken(token);
    window.history.replaceState({}, '', '/');

    let redirect: string | null = null;
    try { redirect = localStorage.getItem('post_login_redirect'); } catch {}
    if (redirect) {
      try { localStorage.removeItem('post_login_redirect'); } catch {}
      this.router.navigateByUrl(redirect).catch(() => this.router.navigateByUrl('/'));
    }
  }
}
