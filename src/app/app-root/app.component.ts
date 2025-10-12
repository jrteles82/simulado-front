import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.handleAuthCallback();
  }

  private handleAuthCallback() {
    const m = window.location.hash.match(/token=([^&]+)/);
    if (!m) return;
    const token = decodeURIComponent(m[1]);
    this.auth.setToken(token);
    window.history.replaceState({}, '', '/');
  }
}
