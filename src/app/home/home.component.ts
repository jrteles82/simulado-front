import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthButtonComponent } from '../auth-button/auth-button.component';
import { LandingNavbarComponent, LandingNavItem } from '../shared/landing-navbar/landing-navbar.component';

type Feature = { icon: string; title: string; description: string };
type Plan = { name: string; price: string; description: string; perks: string[]; popular?: boolean };
type Testimonial = { quote: string; author: string; role: string };

type Faq = { question: string; answer: string };

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, RouterLink, LandingNavbarComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  readonly heroCtaLink = ['/simulado'];
  readonly homeNavItems: LandingNavItem[] = [
    { label: 'Simulados', routerLink: ['/simulado'] },
    { label: 'Benefícios', href: '#features' },
    { label: 'Planos', href: '#plans' },
    { label: 'Depoimentos', href: '#testimonials' },
    { label: 'Perguntas', href: '#faq' },
  ];
  readonly currentYear = new Date().getFullYear();
  readonly features: Feature[] = [
    {
      icon: 'fas fa-stopwatch',
      title: 'Simulados realistas',
      description: 'Questões atualizadas e categorizadas por banca, elaboradas para reproduzir o ritmo da prova oficial.',
    },
    {
      icon: 'fas fa-chart-line',
      title: 'Painel de performance',
      description: 'Acompanhe acertos, tempo de resposta e evolução por disciplina em um painel visual e intuitivo.',
    },
    {
      icon: 'fas fa-graduation-cap',
      title: 'Conteúdo direcionado',
      description: 'Receba recomendações automáticas de estudo a partir do seu desempenho e foque no que importa.',
    },
  ];

  readonly plans: Plan[] = [
    {
      name: 'Start',
      price: 'Grátis',
      description: 'Ideal para conhecer a plataforma e resolver simulados avulsos.',
      perks: ['Simulados limitados por mês', 'Histórico básico de desempenho', 'Acesso via desktop ou mobile'],
    },
    {
      name: 'Pro',
      price: 'R$ 29/mês',
      description: 'Para candidatos que querem treinar com intensidade e ter relatórios avançados.',
      perks: ['Simulados ilimitados', 'Relatórios detalhados por competência', 'Exportação de resultados e ranking'],
      popular: true,
    },
    {
      name: 'Equipe',
      price: 'Sob consulta',
      description: 'Treine squads, turmas ou equipes inteiras com acompanhamento centralizado.',
      perks: ['Painel administrativo completo', 'Gestão de licenças e lotes', 'Suporte prioritário e treinamentos'],
    },
  ];

  readonly testimonials: Testimonial[] = [
    {
      quote: 'Com os simulados semanais consegui medir meu progresso e focar nas matérias que mais errava. Passei em uma excelente colocação.',
      author: 'Juliana Andrade',
      role: 'Aprovada – Concurso Câmara Municipal 2024',
    },
    {
      quote: 'Adorei os relatórios de desempenho. Eles me mostraram exatamente onde eu estava perdendo tempo e como ajustar meu estudo.',
      author: 'Tiago Rezende',
      role: 'Servidor Público e Mentor de Estudos',
    },
    {
      quote: 'Utilizamos a plataforma para treinar nosso time jurídico e o ganho de performance foi imediato.',
      author: 'Equipe Jurídica Porto Velho',
      role: 'Treinamento corporativo',
    },
  ];

  readonly faqs: Faq[] = [
    {
      question: 'Posso testar antes de assinar?',
      answer: 'Sim. O plano Start é gratuito e permite que você realize simulados limitados todos os meses para experimentar a experiência completa.',
    },
    {
      question: 'Os simulados são atualizados com novas questões?',
      answer: 'Nossa equipe editorial adiciona novas questões e revisa conteúdos semanalmente, sempre alinhada aos editais recentes da FGV.',
    },
    {
      question: 'Consigo estudar pelo celular?',
      answer: 'Sim, a plataforma é responsiva e você pode resolver simulados pelo navegador no seu smartphone ou tablet sem instalar nada.',
    },
  ];
}
