import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Question } from '../models/question';


@Injectable({ providedIn: 'root' })
export class QuestionsService {
  private base = `${environment.apiBase}/questions`;
  constructor(private http: HttpClient) {}

  list(opts: { categoryId?: number; search?: string; take?: number; skip?: number } = {}) {
    let params = new HttpParams();
    if (opts.categoryId != null) params = params.set('categoryId', String(opts.categoryId));
    if (opts.search) params = params.set('search', opts.search);
    if (opts.take != null) params = params.set('take', String(opts.take));
    if (opts.skip != null) params = params.set('skip', String(opts.skip));
    return this.http.get<Question[]>(this.base, { params });
  }

  count(opts: { categoryId?: number; search?: string } = {}) {
    let params = new HttpParams();
    if (opts.categoryId != null) params = params.set('categoryId', String(opts.categoryId));
    if (opts.search) params = params.set('search', opts.search);
    return this.http.get<number>(`${this.base}/count`, { params });
  }

  get(id: number) { return this.http.get<Question>(`${this.base}/${id}`); }
}
