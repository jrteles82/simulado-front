import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Plan } from './plans.service';

export interface AdminPlan extends Plan {
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminPlansService {
  private base = `${environment.apiBase}/admin/plans`;
  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<AdminPlan[]>(this.base);
  }

  get(id: number) {
    return this.http.get<AdminPlan>(`${this.base}/${id}`);
  }

  create(payload: Partial<AdminPlan>) {
    return this.http.post<AdminPlan>(this.base, payload);
  }

  update(id: number, payload: Partial<AdminPlan>) {
    return this.http.patch<AdminPlan>(`${this.base}/${id}`, payload);
  }

  remove(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
