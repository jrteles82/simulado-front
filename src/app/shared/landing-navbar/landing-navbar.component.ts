import { Component, Input } from '@angular/core';
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
export class LandingNavbarComponent {
  @Input() brandLink: string | any[] = ['/'];
  @Input() brandMark = 'SF';
  @Input() brandLabel = 'Simulado FGV';
  @Input() navItems: LandingNavItem[] = [];
  @Input() mobileCta: { label: string; routerLink: string | any[] } | null = {
    label: 'Começar',
    routerLink: ['/simulado'],
  };
  @Input() showAuthButton = true;
  @Input() logoutHandler: (() => void) | null = null;
}
