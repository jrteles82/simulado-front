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
  templateUrl: './home.component.html',
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
