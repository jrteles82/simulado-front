import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Category } from '../models/category';

@Injectable({ providedIn: 'root' })
export class AdminCategoriesService {
  private base = `${environment.apiBase}/categories`;
  constructor(private http: HttpClient) {}
  list() { return this.http.get<Category[]>(this.base); }
  get(id: number) { return this.http.get<Category>(`${this.base}/${id}`); }
  create(data: Partial<Category>) { return this.http.post<Category>(this.base, data); }
  update(id: number, data: Partial<Category>) { return this.http.patch<Category>(`${this.base}/${id}`, data); }
  remove(id: number) { return this.http.delete(`${this.base}/${id}`); }
}
