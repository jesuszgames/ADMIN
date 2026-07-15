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
    path: 'staff',
    loadComponent: () => import('./features/staff/pages/staff/staff').then((m) => m.StaffComponent),
    canActivate: [authGuard],
  },
  {
    path: 'players',
    loadComponent: () => import('./features/players/pages/players/players').then((m) => m.PlayersComponent),
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
    path: 'banners',
    loadComponent: () => import('./features/banners/pages/banners/banners').then((m) => m.Banners),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
