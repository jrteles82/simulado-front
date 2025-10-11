import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminCategoriesService } from '../services/admin-categories.service';
import { Category } from '../models/category';


@Component({
  standalone: true,
  selector: 'app-category-form',
  imports: [CommonModule, FormsModule],
  template: `
    <h3>{{id ? 'Editar' : 'Nova'}} Categoria</h3>
    <form (ngSubmit)="save()">
      <label>Nome</label>
      <input [(ngModel)]="form.name" name="name" required />
      <label>Slug</label>
      <input [(ngModel)]="form.slug" name="slug" required pattern="[a-z0-9-]+" />
      <div style="margin-top:.5rem">
        <button type="submit">Salvar</button>
        <button type="button" *ngIf="id" (click)="del()" style="margin-left:.5rem">Excluir</button>
      </div>
    </form>
  `
})
export class AdminCategoryFormComponent implements OnInit {
  id?: number;
  form: Partial<Category> = { name:'', slug:'' };

  constructor(private route: ActivatedRoute, private api: AdminCategoriesService, private router: Router) {}

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = idParam ? Number(idParam) : undefined;
    if (this.id) this.api.get(this.id).subscribe(c => this.form = c);
  }

  save() {
    const req = this.id ? this.api.update(this.id, this.form) : this.api.create(this.form);
    req.subscribe(() => this.router.navigateByUrl('/admin/categories'));
  }
  del() {
    if (!this.id) return;
    if (confirm('Confirmar exclusão?'))
      this.api.remove(this.id).subscribe(() => this.router.navigateByUrl('/admin/categories'));
  }
}
