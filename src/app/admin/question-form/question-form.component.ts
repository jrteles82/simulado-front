import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminQuestionsService } from '../../services/admin-questions.service';
import { AdminCategoriesService } from '../../services/admin-categories.service';
import { Category, Question } from '../../models';

@Component({
  standalone: true,
  selector: 'app-question-form',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './question-form.component.html',
})
export class AdminQuestionFormComponent implements OnInit {
  id?: number;
  cats: Category[] = [];
  form: Omit<Question,'id'> = { stem:'', options:['',''], correctIndex:0, explanation:'', categoryId: 0 };

  constructor(
    private route: ActivatedRoute,
    private qapi: AdminQuestionsService,
    private capi: AdminCategoriesService,
    private router: Router
  ) {}

  ngOnInit() {
    this.capi.list().subscribe(c => {
      this.cats = c;
      if (!this.form.categoryId && c.length) this.form.categoryId = c[0].id;
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = idParam ? Number(idParam) : undefined;
    if (this.id) this.qapi.get(this.id).subscribe(q => {
      this.form = {
        stem: q.stem,
        options: [...q.options],
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        categoryId: q.categoryId,
      };
    });
  }

  addOpt(){ this.form.options.push(''); }
  removeOpt(i:number){
    if (this.form.options.length <= 2) { return; }
    this.form.options.splice(i,1);
    if (this.form.correctIndex === i) {
      this.form.correctIndex = 0;
    } else if (this.form.correctIndex > i) {
      this.form.correctIndex -= 1;
    }
  }

  save(){
    const req = this.id ? this.qapi.update(this.id, this.form) : this.qapi.create(this.form);
    req.subscribe(() => this.router.navigateByUrl('/admin/questions'));
  }
  del(){
    if (!this.id) return;
    if (confirm('Confirmar exclusão?'))
      this.qapi.remove(this.id).subscribe(() => this.router.navigateByUrl('/admin/questions'));
  }
}
