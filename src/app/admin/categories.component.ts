import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminCategoriesService } from '../services/admin-categories.service';
import { Category } from '../models/category';


@Component({
  standalone: true,
  selector: 'app-admin-categories',
  imports: [CommonModule, RouterLink],
  template: `
    <h3>Categorias</h3>
    <a routerLink="/admin/categories/new">+ Nova</a>
    <table *ngIf="rows.length" border="1" cellpadding="6" style="margin-top:.5rem">
      <tr><th>Nome</th><th>Slug</th><th>Ações</th></tr>
      <tr *ngFor="let c of rows">
        <td>{{c.name}}</td>
        <td>{{c.slug}}</td>
        <td>
          <a [routerLink]="['/admin/categories', c.id]">Editar</a>
        </td>
      </tr>
    </table>
  `
})
export class AdminCategoriesComponent implements OnInit {
  rows: Category[] = [];
  constructor(private api: AdminCategoriesService) {}
  ngOnInit() { this.api.list().subscribe(r => this.rows = r); }
}
