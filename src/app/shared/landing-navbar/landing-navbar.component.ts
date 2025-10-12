import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthButtonComponent } from '../../auth-button/auth-button.component';
import { AuthService } from '../../services/auth.service';

export type LandingNavItem = {
  label: string;
  routerLink?: string | any[];
  href?: string;
  fragment?: string;
  exact?: boolean;
};

@Component({
  standalone: true,
  selector: 'app-landing-navbar',
  imports: [CommonModule, RouterLink, RouterLinkActive, AuthButtonComponent],
  templateUrl: './landing-navbar.component.html',
  styleUrls: ['./landing-navbar.component.css'],
})
export class LandingNavbarComponent implements OnInit, OnDestroy {
  @Input() brandLink: string | any[] = ['/'];
  @Input() brandMark = 'SF';
  @Input() brandLabel = 'Simulado FGV';
  @Input() navItems: LandingNavItem[] = [];
  @Input() mobileCta: { label: string; routerLink: string | any[] } | null = null;
  @Input() showAuthButton = true;
  @Input() logoutHandler: (() => void) | null = null;
  @Input() authRequiredRoutes: string[] = [];
  @Output() loginRequested = new EventEmitter<void>();

  mobileMenuOpen = false;
  private readonly isMobileSignal = signal(false);
  private mediaQuery?: MediaQueryList;
  private readonly mediaListener = (event: MediaQueryListEvent) => this.applyMobileState(event.matches);
  private readonly auth = inject(AuthService);

  ngOnInit(): void {
    if (typeof window === 'undefined') return;
    this.mediaQuery = window.matchMedia('(max-width: 767.98px)');
    this.applyMobileState(this.mediaQuery.matches);
    this.mediaQuery.addEventListener('change', this.mediaListener);
  }

  ngOnDestroy(): void {
    this.mediaQuery?.removeEventListener('change', this.mediaListener);
  }

  toggleMobileNav(): void {
    if (!this.isMobile()) return;
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  handleNavClick(): void {
    this.mobileMenuOpen = false;
  }

  handleLoggedOut(): void {
    this.mobileMenuOpen = false;
    if (this.logoutHandler) this.logoutHandler();
  }

  handleRouterLinkClick(event: Event, item: LandingNavItem) {
    if (!item.routerLink) {
      this.handleNavClick();
      return;
    }
    if (this.shouldRequireAuth(item.routerLink)) {
      event.preventDefault();
      event.stopPropagation();
      this.mobileMenuOpen = false;
      this.loginRequested.emit();
      return;
    }
    this.handleNavClick();
  }

  handleCtaClick(event: Event) {
    if (!this.mobileCta?.routerLink) { return; }
    if (this.shouldRequireAuth(this.mobileCta.routerLink)) {
      event.preventDefault();
      event.stopPropagation();
      this.mobileMenuOpen = false;
      this.loginRequested.emit();
      return;
    }
    this.handleNavClick();
  }

  isMobile(): boolean {
    return this.isMobileSignal();
  }

  private applyMobileState(matches: boolean) {
    this.isMobileSignal.set(matches);
    if (!matches) this.mobileMenuOpen = false;
  }

  private shouldRequireAuth(routerLink: string | any[]): boolean {
    const path = Array.isArray(routerLink) ? routerLink[0] : routerLink;
    if (typeof path !== 'string') return false;
    const normalized = path.startsWith('/') ? path : `/${path}`;
    if (!this.authRequiredRoutes.includes(normalized)) return false;
    return !this.auth.current;
  }
}
