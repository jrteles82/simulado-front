import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminCategoriesService } from '../../services/admin-categories.service';
import { Category } from '../../models';

@Component({
  standalone: true,
  selector: 'app-admin-categories',
  imports: [CommonModule, RouterLink],
  templateUrl: './categories.component.html',
})
export class AdminCategoriesComponent implements OnInit {
  rows: Category[] = [];
  constructor(private api: AdminCategoriesService) {}
  ngOnInit() { this.api.list().subscribe(r => this.rows = r); }
}
