import { Component, OnDestroy, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { loadMercadoPago } from '@mercadopago/sdk-js';
import { PlansService, Plan } from '../services/plans.service';
import { CheckoutService } from '../services/checkout.service';

type PaymentMethod = 'card' | 'pix';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly plansService = inject(PlansService);
  private readonly checkoutService = inject(CheckoutService);

  readonly plans = signal<Plan[]>([]);
  readonly loadingPlans = signal(true);
  readonly plansError = signal<string | null>(null);
  readonly selectedSlug = signal<string | null>(null);
  readonly paymentMethod = signal<PaymentMethod>('card');
  readonly creatingPreference = signal(false);
  readonly checkoutError = signal<string | null>(null);
  readonly paymentId = signal<string | null>(null);
  readonly selectedPlanSignal = computed(() => {
    const slug = this.selectedSlug();
    if (!slug) return undefined;
    return this.plans().find((p) => p.slug === slug);
  });

  private mp: any;
  private bricks: any;
  private walletController: any;

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const slug = params.get('plan');
      if (slug) this.selectedSlug.set(slug);
    });

    this.loadPlans();
    this.initMercadoPago();
  }

  ngOnDestroy(): void {
    if (this.walletController?.unmount) this.walletController.unmount();
  }

  selectPlan(plan: Plan): void {
    this.selectedSlug.set(plan.slug);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { plan: plan.slug },
      replaceUrl: true,
    });
  }

  selectPayment(method: PaymentMethod): void {
    this.paymentMethod.set(method);
    const plan = this.selectedPlanSignal();
    if (plan && this.walletController) {
      this.createBrick(plan, this.paymentMethod());
    }
  }

  async finalize(): Promise<void> {
    const plan = this.selectedPlanSignal();
    if (!plan) {
      this.checkoutError.set('Selecione um plano para continuar.');
      return;
    }
    this.checkoutError.set(null);
    this.creatingPreference.set(true);

    this.checkoutService.start(plan.slug).subscribe({
      next: async ({ preferenceId, paymentId }) => {
        this.creatingPreference.set(false);
        this.paymentId.set(paymentId || null);
        if (paymentId) {
          try { localStorage.setItem('last_payment_id', paymentId); } catch {}
        }
        await this.createBrick(plan, this.paymentMethod(), preferenceId);
      },
      error: () => {
        this.checkoutError.set('Não foi possível iniciar o checkout. Tente novamente.');
        this.creatingPreference.set(false);
      },
    });
  }

  formatPrice(plan: Plan | undefined): string {
    if (!plan) return '';
    return (plan.priceCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: plan.currency || 'BRL' });
  }

  formatDuration(plan: Plan | undefined): string {
    if (!plan?.durationDays) return '';
    if (plan.durationDays % 30 === 0) {
      const months = plan.durationDays / 30;
      return months === 1 ? '1 mês' : `${months} meses`;
    }
    return `${plan.durationDays} dias`;
  }

  private loadPlans(): void {
    this.plansService.list().subscribe({
      next: (plans) => {
        this.plans.set(plans);
        this.loadingPlans.set(false);
        if (!this.selectedSlug() && plans.length) {
          this.selectedSlug.set(plans[0].slug);
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { plan: plans[0].slug },
            replaceUrl: true,
          });
        }
      },
      error: () => {
        this.plansError.set('Falha ao carregar planos disponíveis.');
        this.loadingPlans.set(false);
      },
    });
  }

  private async initMercadoPago(): Promise<void> {
    this.mp = await loadMercadoPago();
    await this.mp.initialize({ locale: 'pt-BR' });
    this.bricks = await this.mp.bricks();
  }

  private async createBrick(plan: Plan, method: PaymentMethod, preferenceId?: string): Promise<void> {
    if (!preferenceId) {
      this.creatingPreference.set(true);
      this.checkoutService.start(plan.slug).subscribe({
        next: async ({ preferenceId: id, paymentId }) => {
          this.creatingPreference.set(false);
          this.paymentId.set(paymentId || null);
          if (paymentId) {
            try { localStorage.setItem('last_payment_id', paymentId); } catch {}
          }
          await this.createBrick(plan, method, id);
        },
        error: () => {
          this.checkoutError.set('Não foi possível iniciar o checkout. Tente novamente.');
          this.creatingPreference.set(false);
        },
      });
      return;
    }

    if (this.walletController?.unmount) {
      this.walletController.unmount();
    }

    const excludedPaymentTypes =
      method === 'card'
        ? ['ticket']
        : ['credit_card', 'debit_card', 'prepaid_card'];

    const settings = {
      initialization: { preferenceId },
      customization: {
        paymentMethods: { excludedPaymentTypes },
        visual: { style: { theme: 'dark' } },
        texts: {
          valueProp: method === 'pix' ? undefined : 'smart_option',
        },
      },
      callbacks: {
        onReady: () => {},
        onSubmit: ({ selectedPaymentMethod }: any) => {
          console.log('Método selecionado', selectedPaymentMethod);
        },
        onError: (error: any) => {
          console.error(error);
          this.checkoutError.set('Ocorreu um erro ao renderizar o pagamento.');
        },
      },
    };

    this.walletController = await this.bricks.create('wallet', 'wallet_container', settings);
  }
}
