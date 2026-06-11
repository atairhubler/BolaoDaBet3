import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/components/layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'configuracao',
        loadComponent: () =>
          import('./features/configuracao/configuracao.component').then(m => m.ConfiguracaoComponent),
      },
      {
        path: 'participantes',
        loadComponent: () =>
          import('./features/participantes/participantes.component').then(m => m.ParticipantesComponent),
      },
      {
        path: 'jogos',
        loadComponent: () =>
          import('./features/jogos/jogos.component').then(m => m.JogosComponent),
      },
      {
        path: 'palpites',
        loadComponent: () =>
          import('./features/palpites/palpites.component').then(m => m.PalpitesComponent),
      },
      {
        path: 'resultados',
        loadComponent: () =>
          import('./features/resultados/resultados.component').then(m => m.ResultadosComponent),
      },
      {
        path: 'classificacao',
        loadComponent: () =>
          import('./features/classificacao/classificacao.component').then(m => m.ClassificacaoComponent),
      },
    ],
  },
  {
    path: 'publico',
    loadComponent: () =>
      import('./features/publico/publico.component').then(m => m.PublicoComponent),
  },
  { path: '**', redirectTo: '' },
];
