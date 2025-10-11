import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminQuestionsService } from '../services/admin-questions.service';
import { AdminCategoriesService } from '../services/admin-categories.service';
import { Category } from '../models/category';
import { Question } from '../models/question';


@Component({
  standalone: true,
  selector: 'app-admin-questions',
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <h3>Questões</h3>
    <a routerLink="/admin/questions/new">+ Nova</a>

    <div style="margin:.5rem 0; display:flex; gap:.5rem; align-items:center">
      <select [(ngModel)]="filter.categoryId" (change)="load()">
        <option [ngValue]="undefined">Todas categorias</option>
        <option *ngFor="let c of cats" [value]="c.id">{{c.name}}</option>
      </select>
      <input [(ngModel)]="filter.search" placeholder="Buscar enunciado..." (keyup.enter)="load()"/>
      <button (click)="load()">Filtrar</button>
    </div>

    <table *ngIf="rows.length" border="1" cellpadding="6">
      <tr><th>Enunciado</th><th>Categoria</th><th>Ações</th></tr>
      <tr *ngFor="let q of rows">
        <td>{{q.stem | slice:0:80}}{{q.stem.length>80?'...':''}}</td>
        <td>{{nameOf(q.categoryId)}}</td>
        <td>
          <a [routerLink]="['/admin/questions', q.id]">Editar</a>
        </td>
      </tr>
    </table>
  `
})
export class AdminQuestionsComponent implements OnInit {
  rows: Question[] = [];
  cats: Category[] = [];
  filter: { categoryId?: number; search?: string } = {};

  constructor(private qapi: AdminQuestionsService, private capi: AdminCategoriesService) {}
  ngOnInit() {
    this.capi.list().subscribe(c => this.cats = c);
    this.load();
  }
  load() { this.qapi.list(this.filter).subscribe(r => this.rows = r); }
  nameOf(id: number) { return this.cats.find(c => c.id === id)?.name || '—'; }
}
