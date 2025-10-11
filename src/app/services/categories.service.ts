import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Category } from '../models';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private base = `${environment.apiBase}/categories`;
  constructor(private http: HttpClient) {}
  list() { return this.http.get<Category[]>(this.base); }
}
