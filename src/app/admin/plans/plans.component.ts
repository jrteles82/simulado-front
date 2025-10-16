import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AdminPlansService, AdminPlan } from '../../services/admin-plans.service';

@Component({
  standalone: true,
  selector: 'app-admin-plans',
  imports: [CommonModule, RouterLink],
  templateUrl: './plans.component.html',
})
export class AdminPlansComponent implements OnInit {
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly plans = signal<AdminPlan[]>([]);

  constructor(private plansService: AdminPlansService, private router: Router) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.plansService.list().subscribe({
      next: (plans) => {
        this.plans.set(plans);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Falha ao carregar planos.');
        this.loading.set(false);
      },
    });
  }

  newPlan(): void {
    this.router.navigate(['/admin/plans/new']);
  }

  edit(plan: AdminPlan): void {
    this.router.navigate(['/admin/plans', plan.id]);
  }

  remove(plan: AdminPlan): void {
    if (!confirm(`Remover plano "${plan.name}"?`)) return;
    this.plansService.remove(plan.id).subscribe({
      next: () => this.refresh(),
      error: () => alert('Falha ao remover plano.'),
    });
  }

  formatPrice(plan: AdminPlan): string {
    return (plan.priceCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: plan.currency || 'BRL' });
  }
}
