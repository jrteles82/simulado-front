import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { QuestionsService } from './services/questions.service';
import { CategoriesService } from './services/category.service';
import { Category } from './models/category';
import { Question } from './models/question';


@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Simulado</h2>

    <div style="display:flex; gap:.5rem; align-items:center; margin:.5rem 0">
      <label>Categoria:</label>
      <select [(ngModel)]="selectedCategoryId" (change)="load()">
        <option [ngValue]="undefined">Todas</option>
        <option *ngFor="let c of categories" [ngValue]="c.id">{{ c.name }}</option>
      </select>

      <input [(ngModel)]="search" placeholder="Buscar enunciado..." (keyup.enter)="load()" />
      <button (click)="load()">Buscar</button>
    </div>

    <div *ngIf="questions.length===0">Nenhuma questão encontrada.</div>
    <ol *ngIf="questions.length">
      <li *ngFor="let q of questions">
        <div style="font-weight:600">{{ q.stem }}</div>
        <ul>
          <li *ngFor="let opt of q.options; let i=index">
            <span [style.fontWeight]="q.correctIndex===i?'600':'400'">
              {{ 'ABCDE'[i] }}. {{ opt }}
            </span>
          </li>
        </ul>
        <details>
          <summary>Comentário</summary>
          <div>{{ q.explanation }}</div>
        </details>
        <hr />
      </li>
    </ol>

    <div style="display:flex; gap:.5rem; align-items:center; margin-top:.5rem">
      <button (click)="prev()" [disabled]="skip===0">Anterior</button>
      <span>Página {{ (skip/take)+1 }}</span>
      <button (click)="next()" [disabled]="questions.length < take">Próxima</button>
    </div>
  `,
})
export class HomeComponent implements OnInit {
  private catsApi = inject(CategoriesService);
  private qApi = inject(QuestionsService);

  categories: Category[] = [];
  selectedCategoryId?: number;
  search = '';
  questions: Question[] = [];

  take = 10;
  skip = 0;

  ngOnInit() {
    this.catsApi.list().subscribe(cs => {
      this.categories = cs;
      this.load();
    });
  }

  load() {
    this.qApi.list({
      categoryId: this.selectedCategoryId,
      search: this.search || undefined,
      take: this.take,
      skip: this.skip
    }).subscribe(qs => this.questions = qs);
  }

  next() { this.skip += this.take; this.load(); }
  prev() { this.skip = Math.max(0, this.skip - this.take); this.load(); }
}
