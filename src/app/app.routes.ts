import { Routes } from '@angular/router';
import { Dashboard } from './features/dashboard/pages/dashboard/dashboard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },

  {
    path: 'raffles',
    loadComponent: () =>
      import('./features/rifas/pages/my-raffles/my-raffles').then((m) => m.Raffles),
  },
  {
    path: 'users',
    loadComponent: () => import('./features/users/pages/users/users').then((m) => m.Users),
  },
  {
    path: 'foundations',
    loadComponent: () =>
      import('./features/foundations/pages/foundations/foundations').then((m) => m.Foundations),
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./features/categories/pages/categories/categories').then((m) => m.Categories),
  },
  {
    path: 'history',
    loadComponent: () => import('./features/history/page/history/history').then((m) => m.History),
  },
  // { path: '**', redirectTo: 'dashboard' },
];
