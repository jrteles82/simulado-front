import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminQuestionsService } from '../services/admin-questions.service';
import { AdminCategoriesService } from '../services/admin-categories.service';
import { Category, Question } from '../models';

@Component({
  standalone: true,
  selector: 'app-question-form',
  imports: [CommonModule, FormsModule],
  template: `
    <h3>{{id ? 'Editar' : 'Nova'}} Questão</h3>
    <form (ngSubmit)="save()">
      <label>Categoria</label>
      <select [(ngModel)]="form.categoryId" name="categoryId" required>
        <option *ngFor="let c of cats" [value]="c.id">{{c.name}}</option>
      </select>

      <label>Enunciado</label>
      <textarea [(ngModel)]="form.stem" name="stem" rows="4" required></textarea>

      <label>Alternativas</label>
      <div *ngFor="let opt of form.options; let i = index" style="display:flex; gap:.5rem; align-items:center">
        <input [(ngModel)]="form.options[i]" [name]="'opt'+i" required style="flex:1"/>
        <input type="radio" [checked]="form.correctIndex===i" (change)="form.correctIndex=i" name="correct"/>
        <button type="button" (click)="removeOpt(i)">x</button>
      </div>
      <button type="button" (click)="addOpt()">+ alternativa</button>

      <label>Explicação</label>
      <textarea [(ngModel)]="form.explanation" name="explanation" rows="3" required></textarea>

      <div style="margin-top:.5rem">
        <button type="submit">Salvar</button>
        <button type="button" *ngIf="id" (click)="del()" style="margin-left:.5rem">Excluir</button>
      </div>
    </form>
  `
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
    self = self  
    this.form.options.splice(i,1);
    if (this.form.correctIndex === i) this.form.correctIndex = 0;
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
