import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LandingNavbarComponent } from '../shared/landing-navbar/landing-navbar.component';
import { Router } from '@angular/router';
import { CategoriesService } from '../services/categories.service';
import { Category } from '../models/category.model';
import { LandingNavItem } from '../shared/landing-navbar/landing-navbar.component';
import { AuthService } from '../services/auth.service';

interface CatalogCategory extends Category {
  description?: string;
}

@Component({
  standalone: true,
  selector: 'app-simulados-catalog',
  imports: [CommonModule, FormsModule, LandingNavbarComponent],
  templateUrl: './simulados-catalog.component.html',
  styleUrls: ['./simulados-catalog.component.css'],
})
export class SimuladosCatalogComponent {
  private readonly categoriesService = inject(CategoriesService);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly categories = signal<CatalogCategory[]>([]);
  readonly searchTerm = signal('');
  readonly sortKey = signal<'name-asc' | 'name-desc'>('name-asc');
  readonly pageSize = 6;
  readonly page = signal(1);
  readonly navItems: LandingNavItem[] = [
    { label: 'Início', routerLink: ['/'] },
    { label: 'Catálogo', routerLink: ['/simulados'] },
    { label: 'Minha conta', routerLink: ['/area-do-candidato'] },
  ];
  readonly authRequiredRoutes = ['/area-do-candidato'];

  readonly pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  readonly filtered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const sorted = [...this.categories()].sort((a, b) => {
      if (this.sortKey() === 'name-desc') {
        return b.name.localeCompare(a.name);
      }
      return a.name.localeCompare(b.name);
    });
    const searched = term ? sorted.filter((c) => c.name.toLowerCase().includes(term) || (c.description ?? '').toLowerCase().includes(term)) : sorted;
    const start = (this.page() - 1) * this.pageSize;
    return searched.slice(start, start + this.pageSize);
  });

  readonly totalPages = computed(() => {
    if (!this.categories().length) return 1;
    const term = this.searchTerm().trim().toLowerCase();
    const filtered = term
      ? this.categories().filter((c) => c.name.toLowerCase().includes(term) || (c.description ?? '').toLowerCase().includes(term))
      : this.categories();
    const total = Math.max(1, Math.ceil(filtered.length / this.pageSize));
    if (this.page() > total) this.page.set(total);
    return total;
  });

  constructor() {
    this.categoriesService.list().subscribe({
      next: (cats) => {
        const enriched = cats.map((c) => ({
          ...c,
          description: this.descriptionFor(c),
        }));
        this.categories.set(enriched);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Falha ao carregar categorias de simulados. Tente novamente mais tarde.');
        this.loading.set(false);
      },
    });
  }

  onSearch(term: string) {
    this.searchTerm.set(term);
    this.page.set(1);
  }

  onSort(key: 'name-asc' | 'name-desc') {
    this.sortKey.set(key);
    this.page.set(1);
  }

  goToPage(page: number) {
    const total = this.totalPages();
    if (page < 1 || page > total) return;
    this.page.set(page);
  }

  openSimulado(category: CatalogCategory) {
    if (!this.auth.current) {
      try { localStorage.setItem('post_login_redirect', `/simulado?category=${category.id}`); } catch {}
      this.loginRequested();
      return;
    }
    this.router.navigate(['/simulado'], { queryParams: { category: category.id } });
  }

  loginRequested() {
    this.router.navigate(['/'], { state: { loginRequired: true } });
  }

  private descriptionFor(category: Category): string {
    const baseDescriptions: Record<string, string> = {
      linguagem: 'Aprimore interpretação, gramática e redação com simulados focados na banca FGV.',
      juridico: 'Questões específicas de legislação municipal e direito administrativo para cargos jurídicos.',
      exatas: 'Simulados de matemática, raciocínio lógico e estatística para manter o cálculo afiado.',
      gerais: 'Conteúdo amplo de conhecimentos gerais, história e atualidades.',
    };
    const key = category.slug?.toLowerCase();
    if (key && baseDescriptions[key]) return baseDescriptions[key];
    return 'Coleção de simulados cuidadosamente selecionados para você dominar esta categoria.';
  }
}
