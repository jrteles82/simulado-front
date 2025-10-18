import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface CheckoutSubmitResponse {
  paymentId: string | number | null;
  status?: string | null;
  subscriptionId?: string | number | null;
  mpPaymentId?: string | number | null;
  redirectUrl?: string | null;
}

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private base = environment.apiBase;
  constructor(private http: HttpClient) {}

  start(planSlug: string) {
    return this.http.post<{ preferenceId: string; paymentId: string | null }>(`${this.base}/payments/checkout`, { planSlug });
  }

  submitPayment(payload: {
    planSlug: string;
    preferenceId: string;
    paymentId?: string | null;
    selectedPaymentMethod: any;
    formData: any;
  }) {
    return this.http.post<CheckoutSubmitResponse>(`${this.base}/payments/checkout/payment`, payload);
  }

  getStatus(paymentId: string) {
    return this.http.get<{ id: string; status: string; amount: number; currency: string; planName?: string; createdAt?: string }>(`${this.base}/payments/${paymentId}`);
  }
}
