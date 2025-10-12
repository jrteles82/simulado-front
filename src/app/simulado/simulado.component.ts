import { Component, OnDestroy, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { QuestionsService } from '../services/questions.service';
import { CategoriesService } from '../services/categories.service';
import { Category } from '../models/category.model';
import { Question } from '../models/question.model';
import { AuthButtonComponent } from '../auth-button/auth-button.component';
import { AuthService } from '../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-simulado',
  imports: [CommonModule, FormsModule, AuthButtonComponent],
  templateUrl: './simulado.component.html',
  styleUrls: ['../app-root/app.component.css'],
})
export class SimuladoComponent implements OnInit, OnDestroy {
  private readonly document = inject(DOCUMENT);
  title = 'Simulado FGV – Câmara de Porto Velho';

  categories = signal<Category[]>([]);
  categoryId = signal<number | undefined>(undefined);

  pool = signal<Question[]>([]);
  order = signal<number[]>([]);
  idx = signal<number>(0);

  answers = signal<Record<number, number>>({});
  showExplain = signal<Record<number, boolean>>({});
  started = signal<boolean>(false);

  seconds = signal<number>(0);
  private timer: any;

  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  readonly Math = Math;
  private readonly alphabet = 'abcdefghijklmnopqrstuvwxyz';
  loginModalOpen = signal<boolean>(false);

  constructor(
    private qService: QuestionsService,
    private cService: CategoriesService,
    private auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.cService.list().subscribe({
      next: (cats) => {
        this.categories.set(cats);
        const first = cats[0]?.id;
        this.categoryId.set(first);
        this.loadCategoryById(first);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Falha ao carregar categorias. Verifique a API.');
        this.loading.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  total = computed(() => this.pool().length);

  current = computed(() => {
    const id = this.order()[this.idx()];
    return this.pool().find((q) => q.id === id);
  });

  answeredCount = computed(() => Object.keys(this.answers()).length);

  correctCount = computed(() =>
    this.pool().filter((q) => this.answers()[q.id] === q.correctIndex).length,
  );

  progressPct = computed(() =>
    this.total() ? Math.round((this.answeredCount() / this.total()) * 100) : 0,
  );

  mistakes = computed(() =>
    this.pool().filter((q) => this.answers()[q.id] !== q.correctIndex),
  );

  loadCategoryById(catId?: number) {
    this.loading.set(true);
    this.error.set(null);
    this.categoryId.set(catId);

    this.pool.set([]);
    this.order.set([]);
    this.idx.set(0);
    this.answers.set({});
    this.showExplain.set({});
    this.started.set(false);
    this.seconds.set(0);
    if (this.timer) clearInterval(this.timer);

    this.qService.list({ categoryId: catId, take: 1000, skip: 0 }).subscribe({
      next: (items) => {
        this.pool.set(items);
        const ids = items.map((q) => q.id);
        this.order.set(this.shuffle(ids));
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Falha ao carregar questões. Verifique se a API está rodando em http://localhost:3000.');
        this.loading.set(false);
      },
    });
  }

  start() {
    if (!this.auth.current) {
      this.loginModalOpen.set(true);
      return;
    }
    this.loginModalOpen.set(false);

    if (this.started()) return;
    this.started.set(true);
    this.timer = setInterval(() => this.seconds.update((s) => s + 1), 1000);
    this.scrollToAnsweredMetrics();
  }

  restart() {
    this.started.set(false);
    this.order.set(this.shuffle(this.pool().map((q) => q.id)));
    this.idx.set(0);
    this.answers.set({});
    this.showExplain.set({});
    this.seconds.set(0);
    this.timer && clearInterval(this.timer);

    // Roda a mesma lógica do start após resetar
    this.start();
  }

  selectAnswer(q: Question, i: number) {
    if (!this.started()) return;
    if (q.id in this.answers()) return;
    this.answers.update((a) => ({ ...a, [q.id]: i }));
    this.showExplain.update((s) => ({ ...s, [q.id]: true }));

    const isLastQuestion = this.idx() === this.total() - 1;
    if (isLastQuestion && this.answeredCount() === this.total()) {
      queueMicrotask(() => this.scrollToFinalReport());
    }
  }

  prev() {
    if (!this.auth.current) {
      this.loginModalOpen.set(true);
      return;
    }
    if (this.idx() > 0) this.idx.update((v) => v - 1);
  }

  next() {
    if (!this.auth.current) {
      this.loginModalOpen.set(true);
      return;
    }
    const currentQuestion = this.current();
    if (!currentQuestion) return;
    if (!(currentQuestion.id in this.answers())) return;
    if (this.idx() < this.total() - 1) {
      this.idx.update((v) => v + 1);
    } else {
      queueMicrotask(() => this.scrollToFinalReport());
    }
  }

  exportCSV() {
    const rows = this.pool().map((q) => ({
      id: q.id,
      categoria: this.nameOfCategoryId(q.categoryId),
      acerto: this.answers()[q.id] === q.correctIndex ? 1 : 0,
      marcado: this.answers()[q.id] != null ? q.options[this.answers()[q.id]] : '',
      correta: q.options[q.correctIndex],
    }));
    const header = Object.keys(rows[0] || { id: '', categoria: '', acerto: '', marcado: '', correta: '' });
    const csv = [
      header.join(';'),
      ...rows.map((r) =>
        header.map((h) => String((r as any)[h]).replace(/;/g, ',')).join(';'),
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    const catName = this.nameOfCategoryId(this.categoryId());
    a.download = `resultado_${catName || 'todas'}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  nameOfCategoryId(id: number | undefined): string {
    if (!id) return 'Todas';
    const c = this.categories().find((x) => x.id === id);
    return c?.name ?? String(id);
  }

  letter(idx: number): string {
    return this.alphabet.charAt(idx);
  }

  isAnswered(id: number): boolean {
    return this.answers()[id] != null;
  }

  closeLoginPrompt() {
    this.loginModalOpen.set(false);
  }

  handleLogout() {
    this.loginModalOpen.set(false);
    const currentCategory = this.categoryId();
    this.loadCategoryById(currentCategory);
  }

  private scrollToAnsweredMetrics() {
    const el = this.document?.getElementById('metricas');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private scrollToFinalReport() {
    const el = this.document?.getElementById('relatorios');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}
