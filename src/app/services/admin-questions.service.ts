import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Question } from '../models';

@Injectable({ providedIn: 'root' })
export class AdminQuestionsService {
  private base = `${environment.apiBase}/questions`;
  constructor(private http: HttpClient) {}

  list(params: { categoryId?: number; search?: string; take?: number; skip?: number } = {}) {
    let p = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) p = p.set(k, String(v));
    });
    return this.http.get<Question[]>(this.base, { params: p });
  }
  get(id: number) { return this.http.get<Question>(`${this.base}/${id}`); }
  create(data: Omit<Question, 'id'>) { return this.http.post<Question>(this.base, data); }
  update(id: number, data: Partial<Question>) { return this.http.patch<Question>(`${this.base}/${id}`, data); }
  remove(id: number) { return this.http.delete(`${this.base}/${id}`); }
}
