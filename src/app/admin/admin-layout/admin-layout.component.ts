import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthButtonComponent } from '../../auth-button/auth-button.component';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-admin-layout',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, AuthButtonComponent],
  templateUrl: './admin-layout.component.html',
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private navSub?: Subscription;

  contentMenuOpen = signal(false);

  ngOnInit(): void {
    this.document.body.classList.add('hold-transition', 'sidebar-mini');
    this.updateMenuState();
    this.navSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.updateMenuState());
  }

  ngOnDestroy(): void {
    this.document.body.classList.remove('hold-transition', 'sidebar-mini');
    this.navSub?.unsubscribe();
  }

  private updateMenuState() {
    const url = this.router.url;
    const open = url.startsWith('/admin/questions') || url.startsWith('/admin/categories');
    this.contentMenuOpen.set(open);
  }
}
