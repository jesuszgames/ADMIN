import { Routes } from '@angular/router';
import { Dashboard } from './features/dashboard/pages/dashboard/dashboard';


export const routes: Routes = [
	{ path: '', redirectTo: 'dashboard', pathMatch: 'full' },
	{ path: 'dashboard', component: Dashboard },
	
	// 👇 Añade tus nuevas páginas (componentes) aquí abajo 👇
	// { path: 'my-rifas', loadComponent: () => import('./features/rifas/pages/my-rifas/my-rifas').then(m => m.MyRifas) },
	// { path: 'users', loadComponent: () => import('./features/users/pages/users/users').then(m => m.Users) },
	
	{ path: '**', redirectTo: 'dashboard' }
];
