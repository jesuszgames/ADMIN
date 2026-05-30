import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { USERS_DATA_MOCK } from '../../helpers/global/user.constants';
import {
  SESSION_STORAGE_KEY_LOGGED_IN,
  SESSION_STORAGE_KEY_USER_NAME,
  DEFAULT_USER_NAME,
  ROUTE_DASHBOARD,
  ROUTE_LOGIN,
  VALUE_TRUE,
} from '../../helpers/global/auth.constants';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly router = inject(Router);
  private memoryStorage: Record<string, string> = {};

  readonly isAuthenticated = signal<boolean>(this.checkInitialSession());

  private safeGetItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(key);
      }
    } catch (e) {
      console.warn('AuthService: LocalStorage block. Falling back to memory storage.', e);
    }
    return this.memoryStorage[key] || null;
  }

  private safeSetItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, value);
        return;
      }
    } catch (e) {
      console.warn('AuthService: LocalStorage set block. Falling back to memory storage.', e);
    }
    this.memoryStorage[key] = value;
  }

  private safeRemoveItem(key: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key);
        return;
      }
    } catch (e) {
      console.warn('AuthService: LocalStorage remove block. Falling back to memory storage.', e);
    }
    delete this.memoryStorage[key];
  }

  private checkInitialSession(): boolean {
    return this.safeGetItem(SESSION_STORAGE_KEY_LOGGED_IN) === VALUE_TRUE;
  }

  login(username?: string, password?: string): boolean {
    if (username && password) {
      this.isAuthenticated.set(true);
      this.safeSetItem(SESSION_STORAGE_KEY_LOGGED_IN, VALUE_TRUE);
      this.safeSetItem(SESSION_STORAGE_KEY_USER_NAME, username);
      
      const role = this.getUserRole();
      if (role === 'SORTEADOR') {
        this.router.navigate(['/draws']).catch((err) => {
          console.error('AuthService: Error al navegar a sorteos:', err);
        });
      } else {
        this.router.navigate([ROUTE_DASHBOARD]).catch((err) => {
          console.error('AuthService: Error al navegar a dashboard:', err);
        });
      }
      return true;
    }
    return false;
  }

  logout(): void {
    this.isAuthenticated.set(false);
    this.safeRemoveItem(SESSION_STORAGE_KEY_LOGGED_IN);
    this.safeRemoveItem(SESSION_STORAGE_KEY_USER_NAME);
    this.router.navigate([ROUTE_LOGIN]).catch((err) => {
      console.error('AuthService: Error al navegar a login:', err);
    });
  }

  getUserName(): string {
    return this.safeGetItem(SESSION_STORAGE_KEY_USER_NAME) || DEFAULT_USER_NAME;
  }

  getUserRole(): 'ADMIN' | 'SORTEADOR' | 'USUARIO' {
    const username = this.getUserName().toLowerCase().trim();
    const user = USERS_DATA_MOCK.find(
      (u) =>
        u.name.toLowerCase().trim() === username ||
        u.email.toLowerCase().trim() === username
    );
    return user ? (user.role as 'ADMIN' | 'SORTEADOR' | 'USUARIO') : 'ADMIN';
  }
}

