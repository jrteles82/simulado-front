import { Component, OnDestroy, OnInit, computed, inject, signal, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { loadMercadoPago } from '@mercadopago/sdk-js';
import { PlansService, Plan } from '../services/plans.service';
import { CheckoutService, CheckoutSubmitResponse } from '../services/checkout.service';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../services/auth.service';

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
  private readonly auth = inject(AuthService);
  private readonly zone = inject(NgZone);

  readonly plans = signal<Plan[]>([]);
  readonly loadingPlans = signal(true);
  readonly plansError = signal<string | null>(null);
  readonly selectedSlug = signal<string | null>(null);
  readonly creatingPreference = signal(false);
  readonly checkoutError = signal<string | null>(null);
  readonly checkoutErrorVariant = signal<'danger' | 'warning' | 'info' | 'success'>('danger');
  readonly paymentId = signal<string | null>(null);
  readonly preferenceId = signal<string | null>(null);
  readonly selectedPlanSignal = computed(() => {
    const slug = this.selectedSlug();
    if (!slug) return undefined;
    return this.plans().find((p) => p.slug === slug);
  });

  private mp: any;
  private bricks: any;
  private brickController: any;
  private initBricksPromise: Promise<void> | null = null;

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const slug = params.get('plan');
      if (slug) {
        this.selectedSlug.set(slug);
        const plan = this.plans().find((p) => p.slug === slug);
        if (plan) {
          this.selectPlan(plan, { updateRoute: false });
        }
      }
    });

    this.loadPlans();
    this.initMercadoPago().catch((err) => console.error('Falha ao iniciar Mercado Pago', err));
  }

  ngOnDestroy(): void {
    this.cleanupBrick();
  }

  selectPlan(plan: Plan, options: { updateRoute?: boolean } = {}): void {
    const updateRoute = options.updateRoute ?? true;
    const currentSlug = this.selectedSlug();
    const changed = currentSlug !== plan.slug;

    if (changed) {
      this.cleanupBrick();
      this.preferenceId.set(null);
      this.paymentId.set(null);
      this.selectedSlug.set(plan.slug);
      if (updateRoute) {
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { plan: plan.slug },
          replaceUrl: true,
        });
      }
    }

    this.prepareCheckout(plan, { force: changed });
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

  private setCheckoutError(message: string | null, variant: 'danger' | 'warning' | 'info' | 'success' = 'danger'): void {
    this.checkoutErrorVariant.set(variant);
    this.checkoutError.set(message);
  }

  private loadPlans(): void {
    this.plansService.list().subscribe({
      next: (plans) => {
        this.plans.set(plans);
        this.loadingPlans.set(false);
        const currentSlug = this.selectedSlug();
        const initialPlan = currentSlug
          ? plans.find((p) => p.slug === currentSlug) || plans[0]
          : plans[0];
        if (initialPlan) {
          const shouldUpdateRoute = !currentSlug || currentSlug !== initialPlan.slug;
          this.selectPlan(initialPlan, { updateRoute: shouldUpdateRoute });
        }
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
          this.setCheckoutError('Não foi possível carregar o módulo de pagamento.');
          this.initBricksPromise = null;
          throw err;
        });
    }
    return this.initBricksPromise;
  }

  private prepareCheckout(plan: Plan, options: { force?: boolean } = {}): void {
    const { force } = options;
    const existingPreference = this.preferenceId();

    if (existingPreference && !force) {
      this.renderPaymentBrick(plan, existingPreference).catch((err) => {
        console.error(err);
        this.setCheckoutError('Ocorreu um erro ao preparar o pagamento.');
      });
      return;
    }

    if (this.creatingPreference() && !force) {
      return;
    }

    this.setCheckoutError(null);
    this.creatingPreference.set(true);

    const targetSlug = plan.slug;

    this.checkoutService.start(plan.slug).subscribe({
      next: ({ preferenceId, paymentId }) => {
        if (this.selectedSlug() !== targetSlug) {
          return;
        }
        this.creatingPreference.set(false);
        this.preferenceId.set(preferenceId);
        this.paymentId.set(paymentId || null);
        if (paymentId) {
          try { localStorage.setItem('last_payment_id', paymentId); } catch {}
        }
        this.renderPaymentBrick(plan, preferenceId).catch((err) => {
          console.error(err);
          this.setCheckoutError('Não foi possível preparar o pagamento.');
        });
      },
      error: () => {
        if (this.selectedSlug() === targetSlug) {
          this.setCheckoutError('Não foi possível iniciar o checkout. Tente novamente.');
          this.creatingPreference.set(false);
        }
      },
    });
  }

  private async renderPaymentBrick(plan: Plan, preferenceId: string): Promise<void> {
    if (this.selectedSlug() !== plan.slug) {
      return;
    }
    this.setCheckoutError(null);
    this.cleanupBrick();

    await this.initMercadoPago();
    await new Promise((resolve) => setTimeout(resolve, 0));
    if (!this.bricks?.create) {
      throw new Error('Mercado Pago Bricks não está disponível.');
    }

    if (this.selectedSlug() !== plan.slug) {
      return;
    }

    const amount = (plan.priceCents ?? 0) / 100;
    const payer = this.buildPayer();
    const initialization: any = { amount, preferenceId };
    if (payer) initialization.payer = payer;

    const settings = {
      mercadoPago: this.mp,
      initialization,
      customization: {
        visual: { style: { theme: 'default' } },
        paymentMethods: {
          creditCard: 'all',
          debitCard: 'all',
          bankTransfer: 'all',
          maxInstallments: 12,
        },
      },
      callbacks: {
        onReady: () => {
          // se for alterar qualquer estado aqui, use Zone
          this.zone.run(() => {});
        },
        onSubmit: ({ selectedPaymentMethod, formData }: any) => {
          // SEMPRE garantir execução dentro da NgZone
          return this.zone.run(() =>
            this.handlePaymentSubmit(plan, preferenceId, selectedPaymentMethod, formData)
          );
        },
        onError: (error: any) => {
          this.zone.run(() => {
            console.error(error);
            this.setCheckoutError('Ocorreu um erro ao renderizar o pagamento.');
          });
        },
      },
    };

    // IMPORTANTE: criação do brick pode disparar callbacks fora da Zone
    this.brickController = await this.bricks.create('payment', 'payment_brick_container', settings);
  }

  private cleanupBrick(): void {
    if (this.brickController?.unmount) {
      try { this.brickController.unmount(); } catch (err) { console.warn('Erro ao desmontar brick', err); }
    }
    this.brickController = null;
  }

  private buildPayer() {
    const user = this.auth.current;
    if (!user) return undefined;
    const name = (user.name || '').trim();
    if (!name) {
      return { email: user.email, firstName: '', lastName: '', entityType: 'individual' };
    }
    const [firstName, ...rest] = name.split(/\s+/);
    return {
      email: user.email,
      firstName: firstName || '',
      lastName: rest.join(' ') || '',
      entityType: 'individual',
    };
  }

  private async handlePaymentSubmit(
    plan: Plan,
    preferenceId: string,
    selectedPaymentMethod: any,
    formData: any,
  ): Promise<void> {
    // Este método já é chamado dentro da Zone (ver callbacks.onSubmit)
    this.setCheckoutError(null);
    this.creatingPreference.set(true);
    try {
      const response: CheckoutSubmitResponse = await firstValueFrom(this.checkoutService.submitPayment({
        planSlug: plan.slug,
        preferenceId,
        paymentId: this.paymentId(),
        selectedPaymentMethod,
        formData,
      }));

      const rawPaymentId = response?.paymentId ?? (response as any)?.id ?? null;
      const paymentId = rawPaymentId != null ? String(rawPaymentId) : null;
      if (paymentId) {
        this.paymentId.set(paymentId);
        try { localStorage.setItem('last_payment_id', paymentId); } catch {}
      }

      if (response?.redirectUrl) {
        // Se for rota do próprio app, use Router; externo -> navegação hard
        const url = new URL(response.redirectUrl, window.location.origin);
        if (url.origin === window.location.origin) {
          await this.router.navigateByUrl(url.pathname + url.search);
        } else {
          window.location.assign(url.toString());
        }
        return;
      }

      const status = response?.status ? String(response.status).toUpperCase() : null;
      if (status === 'APPROVED') {
        this.setCheckoutError(null);
        this.cleanupBrick();
        await this.router.navigate(['/home'], {
          queryParams: paymentId ? { paymentId } : undefined,
          replaceUrl: true,
        });
        return;
      }

      if (status === 'PENDING') {
        this.setCheckoutError('Pagamento pendente de confirmação. Você será notificado assim que for aprovado.', 'warning');
      } else if (status === 'REJECTED' || status === 'CANCELLED') {
        this.setCheckoutError('Pagamento não autorizado. Verifique os dados informados ou tente outro método.');
      }
    } catch (error) {
      console.error('Falha ao processar pagamento com cartão', error);
      this.setCheckoutError('Não foi possível processar o pagamento. Verifique os dados e tente novamente.');
      throw error;
    } finally {
      this.creatingPreference.set(false);
    }
  }
}
