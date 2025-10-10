import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Category, Question } from './models/question';
import { AuthButtonComponent } from './auth-button.component';
import { QuestionsService } from './services/questions.service';
import { environment } from 'src/environments/environment';
import { AuthService } from './services/auth.service';

type UIcategory = { key: Category; label: string };

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, AuthButtonComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Simulado FGV – Câmara de Porto Velho';
  categories: UIcategory[] = [
    { key: 'PORTUGUES', label: 'Português' },
    { key: 'DIREITO_CONSTITUCIONAL', label: 'Direito Constitucional' },
    { key: 'MISTO', label: 'Misto' }
  ];

  category = signal<Category>('PORTUGUES');
  pool = signal<Question[]>([]);
  order = signal<string[]>([]);
  idx = signal<number>(0);

  answers = signal<Record<string, number>>({});
  showExplain = signal<Record<string, boolean>>({});
  started = signal<boolean>(false);

  seconds = signal<number>(0);
  private timer: any;

  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  readonly Math = Math;
  private readonly alphabet = 'abcdefghijklmnopqrstuvwxyz';

  constructor(private qService: QuestionsService, private auth: AuthService) {}

  ngOnInit(): void {
    this.handleAuthCallback();
    this.loadCategory(this.category());
  }
  ngOnDestroy(): void { if (this.timer) clearInterval(this.timer); }

  total = computed(() => this.pool().length);
  current = computed(() => this.pool().find(q => q.id === this.order()[this.idx()]));
  answeredCount = computed(() => Object.keys(this.answers()).length);
  correctCount = computed(() =>
    this.pool().filter(q => this.answers()[q.id] === q.correctIndex).length
  );
  progressPct = computed(() => this.total() ? Math.round((this.answeredCount() / this.total()) * 100) : 0);
  mistakes = computed(() =>
    this.pool().filter(q => this.answers()[q.id] !== q.correctIndex)
  );

  loadCategory(cat: Category) {
    this.loading.set(true);
    this.error.set(null);
    this.category.set(cat);
    this.pool.set([]);
    this.order.set([]);
    this.idx.set(0);
    this.answers.set({});
    this.showExplain.set({});
    this.started.set(false);
    this.seconds.set(0);
    if (this.timer) clearInterval(this.timer);

    this.qService.listAllByCategory(cat).subscribe({
      next: (items) => {
        this.pool.set(items);
        const ids = items.map(q => q.id);
        this.order.set(this.shuffle(ids));
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Falha ao carregar questões. Verifique se a API está rodando em http://localhost:3000.');
        this.loading.set(false);
      }
    });
  }

  start() {
    if (this.started()) return;
    this.started.set(true);
    this.timer = setInterval(() => this.seconds.update(s => s + 1), 1000);
  }

  restart() {
    this.order.set(this.shuffle(this.pool().map(q => q.id)));
    this.idx.set(0);
    this.answers.set({});
    this.showExplain.set({});
    this.started.set(false);
    this.seconds.set(0);
    if (this.timer) clearInterval(this.timer);
  }

  loginWithGoogle() {
    window.location.href = environment.auth.googleStart;
  }

  selectAnswer(q: Question, i: number) {
    if (!this.started()) return;
    if (q.id in this.answers()) return;
    this.answers.update(a => ({ ...a, [q.id]: i }));
    this.showExplain.update(s => ({ ...s, [q.id]: true }));
  }

  prev() { if (this.idx() > 0) this.idx.update(v => v - 1); }
  next() { if (this.idx() < this.total() - 1) this.idx.update(v => v + 1); }

  exportCSV() {
    const rows = this.pool().map(q => ({
      id: q.id,
      categoria: q.category,
      acerto: this.answers()[q.id] === q.correctIndex ? 1 : 0,
      marcado: this.answers()[q.id] != null ? q.options[this.answers()[q.id]] : '',
      correta: q.options[q.correctIndex],
    }));
    const header = Object.keys(rows[0] || { id:'', categoria:'', acerto:'', marcado:'', correta:'' });
    const csv = [header.join(';'),
      ...rows.map(r => header.map(h => String((r as any)[h]).replace(/;/g, ',')).join(';'))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `resultado_${this.category()}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  humanCategory(cat: Category): string {
    const m: Record<Category, string> = {
      'PORTUGUES': 'Português',
      'DIREITO_CONSTITUCIONAL': 'Direito Constitucional',
      'MISTO': 'Misto',
    };
    return m[cat];
  }

  letter(idx: number): string {
    return this.alphabet.charAt(idx);
  }

  isAnswered(id: string): boolean {
    return this.answers()[id] != null;
  }

  private shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  private handleAuthCallback() {
    const m = window.location.hash.match(/token=([^&]+)/);
    if (!m) return;
    const token = decodeURIComponent(m[1]);
    this.auth.setToken(token);
    window.history.replaceState({}, '', '/');
  }
}
