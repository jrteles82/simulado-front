import { Component, OnDestroy, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { loadMercadoPago } from '@mercadopago/sdk-js';
import { PlansService, Plan } from '../services/plans.service';
import { CheckoutService } from '../services/checkout.service';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

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
  readonly preferenceId = signal<string | null>(null);
  readonly selectedPlanSignal = computed(() => {
    const slug = this.selectedSlug();
    if (!slug) return undefined;
    return this.plans().find((p) => p.slug === slug);
  });

  private mp: any;
  private bricks: any;
  private walletController: any;
  private initBricksPromise: Promise<void> | null = null;

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const slug = params.get('plan');
      if (slug) this.selectedSlug.set(slug);
    });

    this.loadPlans();
    this.initMercadoPago().catch((err) => console.error('Falha ao iniciar Mercado Pago', err));
  }

  ngOnDestroy(): void {
    this.cleanupBrick();
  }

  selectPlan(plan: Plan): void {
    this.cleanupBrick();
    this.preferenceId.set(null);
    this.paymentId.set(null);
    this.selectedSlug.set(plan.slug);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { plan: plan.slug },
      replaceUrl: true,
    });
  }

  selectPayment(method: PaymentMethod): void {
    if (this.paymentMethod() === method) return;
    this.cleanupBrick();
    this.paymentMethod.set(method);
    const plan = this.selectedPlanSignal();
    const pref = this.preferenceId();
    if (plan && pref) {
      this.createBrick(plan, method, pref).catch((err) => {
        console.error(err);
        this.checkoutError.set('Ocorreu um erro ao preparar o pagamento.');
      });
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
      next: ({ preferenceId, paymentId }) => {
        this.creatingPreference.set(false);
        this.preferenceId.set(preferenceId);
        this.paymentId.set(paymentId || null);
        if (paymentId) {
          try { localStorage.setItem('last_payment_id', paymentId); } catch {}
        }
        this.createBrick(plan, this.paymentMethod(), preferenceId).catch((err) => {
          console.error(err);
          this.checkoutError.set('Não foi possível preparar o pagamento.');
        });
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
        if (!this.selectedSlug() && plans.length) this.selectPlan(plans[0]);
      },
      error: () => {
        this.plansError.set('Falha ao carregar planos disponíveis.');
        this.loadingPlans.set(false);
      },
    });
  }

  private initMercadoPago(): Promise<void> {
    if (!this.initBricksPromise) {
      this.initBricksPromise = loadMercadoPago()
        .then(async (mpInstance) => {
          if (!environment.mpPublicKey) {
            throw new Error('Chave pública do Mercado Pago não configurada.');
          }
          if (!mpInstance) {
            throw new Error('SDK do Mercado Pago não disponível.');
          }
          this.mp = new (mpInstance as any)(environment.mpPublicKey, { locale: 'pt-BR' });
          this.bricks = this.mp.bricks();
        })
        .catch((err) => {
          console.error('Erro ao carregar Mercado Pago', err);
          this.checkoutError.set('Não foi possível carregar o módulo de pagamento.');
          this.initBricksPromise = null;
          throw err;
        });
    }
    return this.initBricksPromise;
  }

  private async createBrick(plan: Plan, method: PaymentMethod, preferenceId?: string): Promise<void> {
    if (!preferenceId) {
      this.creatingPreference.set(true);
      this.checkoutService.start(plan.slug).subscribe({
        next: async ({ preferenceId: id, paymentId }) => {
          this.creatingPreference.set(false);
          this.preferenceId.set(id);
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

    this.cleanupBrick();

    await this.initMercadoPago();
    await new Promise((resolve) => setTimeout(resolve, 0));

    const containerId = method === 'card' ? 'card_wallet_container' : 'pix_wallet_container';

    if (method === 'card') {
      const amount = (plan.priceCents ?? 0) / 100;
      const settings = {
        initialization: {
          amount,
          preferenceId,
        },
        customization: {
          visual: { style: { theme: 'dark' } },
        },
        callbacks: {
          onReady: () => {},
          onSubmit: (cardData: any) => this.handleCardSubmit(plan, preferenceId, cardData),
          onError: (error: any) => {
            console.error(error);
            this.checkoutError.set('Ocorreu um erro ao renderizar o pagamento.');
          },
        },
      };
      this.walletController = await this.bricks.create('cardPayment', containerId, settings);
      return;
    }

    const settings = {
      initialization: { preferenceId },
      customization: {
        paymentMethods: {
          excludedPaymentTypes: ['credit_card', 'debit_card', 'prepaid_card'],
          defaultPaymentMethod: { type: 'pix' },
        },
        visual: { style: { theme: 'dark' } },
      },
      callbacks: {
        onReady: () => {},
        onSubmit: (event: any) => {
          const selectedPaymentMethod = event?.selectedPaymentMethod;
          console.log('Método selecionado', selectedPaymentMethod);
        },
        onError: (error: any) => {
          console.error(error);
          this.checkoutError.set('Ocorreu um erro ao renderizar o pagamento.');
        },
      },
    };

    this.walletController = await this.bricks.create('wallet', containerId, settings);
  }

  private cleanupBrick(): void {
    if (this.walletController?.unmount) {
      try { this.walletController.unmount(); } catch (err) { console.warn('Erro ao desmontar brick', err); }
    }
    this.walletController = null;
  }

  private async handleCardSubmit(plan: Plan, preferenceId: string, cardData: any): Promise<void> {
    this.checkoutError.set(null);
    this.creatingPreference.set(true);
    try {
      const response = await firstValueFrom(this.checkoutService.payWithCard(plan.slug, {
        preferenceId,
        paymentId: this.paymentId(),
        cardData,
      }));
      const paymentId = (response as any)?.paymentId ?? (response as any)?.id ?? null;
      if (paymentId) {
        this.paymentId.set(paymentId);
        try { localStorage.setItem('last_payment_id', paymentId); } catch {}
      }
    } catch (error) {
      console.error('Falha ao processar pagamento com cartão', error);
      this.checkoutError.set('Não foi possível processar o pagamento. Verifique os dados e tente novamente.');
      throw error;
    } finally {
      this.creatingPreference.set(false);
    }
  }
}
