import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthButtonComponent } from '../auth-button/auth-button.component';
import { AuthService } from '../services/auth.service';

interface PaymentSummary {
  id: string;
  date: string;
  amount: string;
  method: string;
  status: 'Pago' | 'Pendente' | 'Cancelado';
}

interface SimuladoReport {
  date: string;
  title: string;
  category: string;
  score: number;
  accuracy: number;
  duration: string;
}

@Component({
  standalone: true,
  selector: 'app-candidate-area',
  imports: [CommonModule, RouterLink, AuthButtonComponent],
  templateUrl: './candidate-area.component.html',
  styleUrls: ['./candidate-area.component.css'],
})
export class CandidateAreaComponent {
  private auth = inject(AuthService);
  readonly user = computed(() => this.auth.current);

  readonly activePlan = signal({
    name: 'Pro',
    renewalDate: '15/11/2024',
    status: 'Ativo',
  });

  readonly paymentHistory = signal<PaymentSummary[]>([
    { id: '#2024-1101', date: '15/10/2024', amount: 'R$ 29,00', method: 'Cartão •••• 9123', status: 'Pago' },
    { id: '#2024-1001', date: '15/09/2024', amount: 'R$ 29,00', method: 'Cartão •••• 9123', status: 'Pago' },
    { id: '#2024-0901', date: '15/08/2024', amount: 'R$ 29,00', method: 'Cartão •••• 9123', status: 'Pago' },
  ]);

  readonly reports = signal<SimuladoReport[]>([
    { date: '02/11/2024', title: 'Simulado Geral', category: 'Conhecimentos Gerais', score: 87, accuracy: 0.87, duration: '58m' },
    { date: '26/10/2024', title: 'Simulado Temático', category: 'Legislação Municipal', score: 76, accuracy: 0.76, duration: '1h12' },
    { date: '19/10/2024', title: 'Simulado FGV', category: 'Língua Portuguesa', score: 92, accuracy: 0.92, duration: '49m' },
  ]);
}
