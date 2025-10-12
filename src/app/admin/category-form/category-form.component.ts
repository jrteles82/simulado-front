import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminCategoriesService } from '../../services/admin-categories.service';
import { Category } from '../../models';

@Component({
  standalone: true,
  selector: 'app-category-form',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './category-form.component.html',
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
