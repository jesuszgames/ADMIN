import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly router = inject(Router);

  readonly isAuthenticated = signal<boolean>(this.checkInitialSession());

  private checkInitialSession(): boolean {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('isLoggedIn') === 'true';
    }
    return false;
  }

  login(username?: string, password?: string): boolean {
    if (username && password) {
      this.isAuthenticated.set(true);
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userName', username);
      }
      this.router.navigate(['/dashboard']);
      return true;
    }
    return false;
  }

  logout(): void {
    this.isAuthenticated.set(false);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userName');
    }
    this.router.navigate(['/login']);
  }

  getUserName(): string {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('userName') || 'Administrador';
    }
    return 'Administrador';
  }
}
