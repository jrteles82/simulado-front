import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminUsersService, AdminUser } from '../../services/admin-users.service';

@Component({
  standalone: true,
  selector: 'app-admin-users',
  imports: [CommonModule],
  templateUrl: './users.component.html',
})
export class AdminUsersComponent implements OnInit {
  loading = true;
  error: string | null = null;
  users: AdminUser[] = [];

  constructor(private api: AdminUsersService) {}

  ngOnInit(): void {
    this.api.list().subscribe({
      next: (res) => {
        this.users = res;
        this.loading = false;
      },
      error: () => {
        this.error = 'Não foi possível carregar a lista de usuários.';
        this.loading = false;
      },
    });
  }
}
