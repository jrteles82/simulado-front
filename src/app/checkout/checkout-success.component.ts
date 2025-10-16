import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CheckoutService } from '../services/checkout.service';

interface PaymentStatusResponse {
  id: string;
  status: string;
  amount: number;
  currency: string;
  planName?: string;
  createdAt?: string;
}

@Component({
  standalone: true,
  selector: 'app-checkout-success',
  imports: [CommonModule, RouterLink],
  templateUrl: './checkout-success.component.html',
  styleUrls: ['./checkout-success.component.css'],
})
export class CheckoutSuccessComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly checkoutService = inject(CheckoutService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly payment = signal<PaymentStatusResponse | null>(null);
  readonly paymentId = signal<string | null>(null);

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const paymentId = params.get('paymentId') || this.loadStoredPaymentId();
      if (!paymentId) {
        this.error.set('Não foi possível identificar o pagamento.');
        this.loading.set(false);
        return;
      }
      this.paymentId.set(paymentId);
      this.fetchStatus(paymentId);
    });
  }

  private fetchStatus(paymentId: string): void {
    this.loading.set(true);
    this.checkoutService.getStatus(paymentId).subscribe({
      next: (payment) => {
        this.payment.set(payment);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível obter o status do pagamento.');
        this.loading.set(false);
      },
    });
  }

  private loadStoredPaymentId(): string | null {
    try {
      const id = localStorage.getItem('last_payment_id');
      if (id) {
        localStorage.removeItem('last_payment_id');
        return id;
      }
    } catch {}
    return null;
  }

  goToSimulados() {
    this.router.navigate(['/simulados']);
  }
}
