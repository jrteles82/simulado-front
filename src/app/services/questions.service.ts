import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Question, Category } from '../models/question';

const API_BASE = '/api';

@Injectable({ providedIn: 'root' })
export class QuestionsService {
  constructor(private http: HttpClient) {}

  list(params: { category?: Category; take?: number; skip?: number; search?: string }): Observable<Question[]> {
    let httpParams = new HttpParams();
    if (params.category) httpParams = httpParams.set('category', params.category);
    if (params.take != null) httpParams = httpParams.set('take', params.take);
    if (params.skip != null) httpParams = httpParams.set('skip', params.skip);
    if (params.search) httpParams = httpParams.set('search', params.search);
    return this.http.get<Question[]>(`${API_BASE}/questions`, { params: httpParams });
  }

  count(params: { category?: Category; search?: string }): Observable<number> {
    let httpParams = new HttpParams();
    if (params.category) httpParams = httpParams.set('category', params.category);
    if (params.search) httpParams = httpParams.set('search', params.search);
    return this.http.get<number>(`${API_BASE}/questions/count`, { params: httpParams });
  }

  getById(id: string): Observable<Question> {
    return this.http.get<Question>(`${API_BASE}/questions/${id}`);
  }

  listAllByCategory(category?: Category): Observable<Question[]> {
    return this.list({ category, take: 1000, skip: 0 }).pipe(
      map(items => items.sort((a, b) => a.id.localeCompare(b.id)))
    );
  }
}
