import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LandingNavbarComponent, LandingNavItem } from '../shared/landing-navbar/landing-navbar.component';
import { AuthButtonComponent } from '../auth-button/auth-button.component';
import { PlansService, Plan } from '../services/plans.service';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';
import { filter, map, take } from 'rxjs/operators';

type Feature = { icon: string; title: string; description: string };
type Testimonial = { quote: string; author: string; role: string };
type Faq = { question: string; answer: string };

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, RouterLink, LandingNavbarComponent, AuthButtonComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly plansService = inject(PlansService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);

  readonly heroCtaLink = ['/simulados'];
  readonly isMobile = signal(false);
  readonly loginModalOpen = signal(false);
  readonly checkoutModalOpen = signal(false);
  readonly plansLoading = signal(true);
  readonly plansError = signal<string | null>(null);
  readonly plans = signal<Plan[]>([]);
  readonly paymentStatusResponse = signal<unknown | null>(null);
  readonly paymentStatusError = signal<string | null>(null);

  readonly homeNavItems: LandingNavItem[] = [
    { label: 'Simulados', routerLink: ['/simulados'] },
    { label: 'Benefícios', href: '#features' },
    { label: 'Planos', href: '#plans' },
    { label: 'Depoimentos', href: '#testimonials' },
    { label: 'Perguntas', href: '#faq' },
  ];
  readonly authRequiredRoutes = ['/simulado', '/area-do-candidato', '/checkout', '/checkout/success'];
  readonly currentYear = new Date().getFullYear();

  readonly features: Feature[] = [
    {
      icon: 'fas fa-stopwatch',
      title: 'Simulados realistas',
      description: 'Questões atualizadas e categorizadas por banca, elaboradas para reproduzir o ritmo da prova oficial.',
    },
    {
      icon: 'fas fa-chart-line',
      title: 'Painel de performance',
      description: 'Acompanhe acertos, tempo de resposta e evolução por disciplina em um painel visual e intuitivo.',
    },
    {
      icon: 'fas fa-graduation-cap',
      title: 'Conteúdo direcionado',
      description: 'Receba recomendações automáticas de estudo a partir do seu desempenho e foque no que importa.',
    },
  ];

  readonly testimonials: Testimonial[] = [
    {
      quote: 'Com os simulados semanais consegui medir meu progresso e focar nas matérias que mais errava. Passei em uma excelente colocação.',
      author: 'Juliana Andrade',
      role: 'Aprovada – Concurso Câmara Municipal 2024',
    },
    {
      quote: 'Adorei os relatórios de desempenho. Eles me mostraram exatamente onde eu estava perdendo tempo e como ajustar meu estudo.',
      author: 'Tiago Rezende',
      role: 'Servidor Público e Mentor de Estudos',
    },
    {
      quote: 'Utilizamos a plataforma para treinar nosso time jurídico e o ganho de performance foi imediato.',
      author: 'Equipe Jurídica Porto Velho',
      role: 'Treinamento corporativo',
    },
  ];

  readonly faqs: Faq[] = [
    {
      question: 'Posso testar antes de assinar?',
      answer: 'Sim. O plano Start é gratuito e permite que você realize simulados limitados todos os meses para experimentar a experiência completa.',
    },
    {
      question: 'Os simulados são atualizados com novas questões?',
      answer: 'Nossa equipe editorial adiciona novas questões e revisa conteúdos semanalmente, sempre alinhada aos editais recentes da FGV.',
    },
    {
      question: 'Consigo estudar pelo celular?',
      answer: 'Sim, a plataforma é responsiva e você pode resolver simulados pelo navegador no seu smartphone ou tablet sem instalar nada.',
    },
  ];

  private mediaQuery?: MediaQueryList;
  private readonly mediaListener = (event: MediaQueryListEvent) => this.isMobile.set(event.matches);

  paymentId?: string | undefined;

  constructor() {}

  ngOnInit(): void {
    // Processa paymentId somente uma vez
    this.route.queryParamMap
      .pipe(
        map((map) => map.get('paymentId')),
        filter((id): id is string => !!id),
        take(1),
      )
      .subscribe((id) => {
        this.paymentId = id;
        this.fetchPaymentStatus(id);
      });

    if (typeof window !== 'undefined') {
      this.mediaQuery = window.matchMedia('(max-width: 767.98px)');
      this.isMobile.set(this.mediaQuery.matches);
      this.mediaQuery.addEventListener('change', this.mediaListener);

      const state = window.history.state as { loginRequired?: boolean };
      if (state?.loginRequired) {
        this.openLoginModal();
        const { loginRequired, ...rest } = state;
        window.history.replaceState(rest, document.title);
      }
    }

    this.plansService.list().subscribe({
      next: (plans) => {
        this.plans.set(plans);
        this.plansLoading.set(false);
      },
      error: () => {
        this.plansError.set('Falha ao carregar planos.');
        this.plansLoading.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    this.mediaQuery?.removeEventListener('change', this.mediaListener);
  }

  openLoginModal() { this.loginModalOpen.set(true); }
  closeLoginModal() { this.loginModalOpen.set(false); }

  formatPrice(plan: Plan): string {
    return (plan.priceCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: plan.currency || 'BRL' });
  }

  formatDuration(plan: Plan): string {
    if (!plan.durationDays) return '';
    if (plan.durationDays % 30 === 0) {
      const months = plan.durationDays / 30;
      return months === 1 ? '1 mês' : `${months} meses`;
    }
    return `${plan.durationDays} dias`;
  }

  checkout(plan: Plan): void {
    const target = `/checkout?plan=${plan.slug}`;
    if (!this.auth.current) {
      try { localStorage.setItem('post_login_redirect', target); } catch {}
      this.openLoginModal();
      return;
    }
    this.router.navigateByUrl(target);
  }

  private fetchPaymentStatus(paymentId: string): void {
    this.paymentStatusError.set(null);

    this.http
      .get(`${environment.apiBase}/payments/status`, { params: { paymentId } })
      .subscribe({
        next: (response: any) => {
          this.paymentStatusResponse.set(response);

          const status = String(response?.payment?.status || '').toUpperCase();

          if (status === 'APPROVED') {
            // Remove o query param sem sair da rota (evita navegar para / de novo)
            this.router.navigate([], {
              relativeTo: this.route,
              queryParams: { paymentId: null },
              queryParamsHandling: 'merge',
              replaceUrl: true,
            });
            // opcional: abrir um toast/modal de sucesso aqui
          } else {
            // opcional: abrir modal/aviso de pendente/recusado
          }
        },
        error: (e) => {
          this.paymentStatusError.set('Não foi possível carregar o status do pagamento.');
          console.log(e);
        },
      });
  }
}
