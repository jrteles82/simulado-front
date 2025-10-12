import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminQuestionsService } from '../services/admin-questions.service';
import { AdminCategoriesService } from '../services/admin-categories.service';
import { Category, Question } from '../models';

@Component({
  standalone: true,
  selector: 'app-admin-questions',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './questions.component.html',
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
