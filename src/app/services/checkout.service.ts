import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private base = environment.apiBase;
  constructor(private http: HttpClient) {}

  start(planSlug: string) {
    return this.http.post<{ preferenceId: string; paymentId: string }>(`${this.base}/payments/checkout`, { planSlug });
  }

  payWithCard(planSlug: string, cardPayload: any) {
    return this.http.post<{ paymentId: string; status: string; redirectUrl?: string }>(`${this.base}/payments/checkout/card`, {
      planSlug,
      ...cardPayload,
    });
  }

  getStatus(paymentId: string) {
    return this.http.get<{ id: string; status: string; amount: number; currency: string; planName?: string; createdAt?: string }>(`${this.base}/payments/${paymentId}`);
  }
}
