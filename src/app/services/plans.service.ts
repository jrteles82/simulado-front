// src/app/services/plans.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';


export interface Plan {
  id: number;
  name: string;
  slug: string;
  priceCents: number;
  currency: string;
  durationDays: number;
}

@Injectable({ providedIn: 'root' })
export class PlansService {
  private base = environment.apiBase || '/api';
  constructor(private http: HttpClient) {}
  list() { return this.http.get<Plan[]>(`${this.base}/payments/plans`); }
}

// src/app/services/checkout.service.ts
@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private base = environment.apiBase || '/api';
  constructor(private http: HttpClient) {}
  start(planSlug: string) {
    return this.http.post<{ preferenceId: string }>(`${this.base}/payments/checkout`, { planSlug });
  }
}
