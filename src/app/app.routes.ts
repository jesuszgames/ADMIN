import { Routes } from '@angular/router';
import { Dashboard } from './features/dashboard/pages/dashboard/dashboard';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/pages/login/login').then((m) => m.LoginComponent),
    canActivate: [guestGuard],
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard],
  },
  {
    path: 'raffles',
    loadComponent: () =>
      import('./features/raflles/pages/my-raffles/my-raffles').then((m) => m.Raffles),
    canActivate: [authGuard],
  },
  {
    path: 'users',
    loadComponent: () => import('./features/users/pages/users/users').then((m) => m.Users),
    canActivate: [authGuard],
  },
  {
    path: 'foundations',
    loadComponent: () =>
      import('./features/foundations/pages/foundations/foundations').then((m) => m.Foundations),
    canActivate: [authGuard],
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./features/categories/pages/categories/categories').then((m) => m.Categories),
    canActivate: [authGuard],
  },
  {
    path: 'history',
    loadComponent: () => import('./features/history/page/history/history').then((m) => m.History),
    canActivate: [authGuard],
  },
  {
    path: 'draws',
    loadComponent: () => import('./features/draws/pages/draws/draws').then((m) => m.Draws),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
