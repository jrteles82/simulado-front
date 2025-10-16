import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminPlansService, AdminPlan } from '../../services/admin-plans.service';

@Component({
  standalone: true,
  selector: 'app-admin-plan-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './plan-form.component.html',
})
export class AdminPlanFormComponent implements OnInit {
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly saving = signal(false);
  plan: Partial<AdminPlan> = {
    name: '',
    slug: '',
    priceCents: 0,
    currency: 'BRL',
    durationDays: 30,
    description: '',
  };

  private planId?: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private plansService: AdminPlansService,
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.planId = idParam ? Number(idParam) : undefined;
    if (this.planId) {
      this.loading.set(true);
      this.plansService.get(this.planId).subscribe({
        next: (plan) => {
          this.plan = { ...plan };
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Plano não encontrado.');
          this.loading.set(false);
        },
      });
    }
  }

  save() {
    this.saving.set(true);
    const payload = { ...this.plan };
    const request = this.planId
      ? this.plansService.update(this.planId, payload)
      : this.plansService.create(payload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/admin/plans']);
      },
      error: () => {
        this.error.set('Falha ao salvar plano.');
        this.saving.set(false);
      }
    });
  }

  cancel() {
    this.router.navigate(['/admin/plans']);
  }

  get isEditing(): boolean { return this.planId != null; }

  get planIdValue(): number | undefined { return this.planId; }
}
