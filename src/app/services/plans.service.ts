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
  description?: string;
  benefits?: string[];
  popular?: boolean;
}

@Injectable({ providedIn: 'root' })
export class PlansService {
  private base = environment.apiBase;
  constructor(private http: HttpClient) {}
  list() { return this.http.get<Plan[]>(`${this.base}/payments/plans`); }
}
