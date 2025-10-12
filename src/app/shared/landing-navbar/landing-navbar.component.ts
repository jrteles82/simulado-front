import { Component, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthButtonComponent } from '../../auth-button/auth-button.component';

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
  @Input() brandMark = 'SM';
  @Input() brandLabel = 'Simuleiro';
  @Input() navItems: LandingNavItem[] = [];
  @Input() showAuthButton = true;
  @Input() logoutHandler: (() => void) | null = null;

  mobileMenuOpen = false;
  private readonly isMobileSignal = signal(false);
  private mediaQuery?: MediaQueryList;
  private readonly mediaListener = (event: MediaQueryListEvent) => this.applyMobileState(event.matches);

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

  isMobile(): boolean {
    return this.isMobileSignal();
  }

  private applyMobileState(matches: boolean) {
    this.isMobileSignal.set(matches);
    if (!matches) this.mobileMenuOpen = false;
  }
}
