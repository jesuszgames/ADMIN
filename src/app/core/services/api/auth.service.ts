import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthResponse } from '../../interfaces/api/auth-response.interface';
import { USERS_DATA_MOCK } from '../../helpers/global/user.constants';
import {
  SESSION_STORAGE_KEY_LOGGED_IN,
  SESSION_STORAGE_KEY_USER_NAME,
  SESSION_STORAGE_KEY_TOKEN,
  SESSION_STORAGE_KEY_USER_ROLE,
  DEFAULT_USER_NAME,
  ROUTE_DASHBOARD,
  ROUTE_LOGIN,
  VALUE_TRUE,
  ROLE_ADMIN,
  ROLE_SORTEADOR,
  ROLE_USUARIO,
  BACKEND_ROLE_ADMIN,
  BACKEND_ROLE_SORT,
  ROUTE_DRAWS,
  MSG_NO_PERMISSIONS,
} from '../../helpers/global/auth.constants';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
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

  login(username?: string, password?: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { username, password }).pipe(
      tap((res) => {
        const data = res.data;
        
        let role: typeof ROLE_ADMIN | typeof ROLE_SORTEADOR | typeof ROLE_USUARIO = ROLE_ADMIN;
        if (data.role) {
          const roles = Array.isArray(data.role) ? data.role : [data.role];
          if (roles.includes(BACKEND_ROLE_ADMIN)) {
            role = ROLE_ADMIN;
          } else if (roles.includes(BACKEND_ROLE_SORT)) {
            role = ROLE_SORTEADOR;
          } else {
            role = ROLE_USUARIO;
          }
        }

        if (role === ROLE_USUARIO) {
          this.logout();
          throw { error: { message: MSG_NO_PERMISSIONS } };
        }

        this.isAuthenticated.set(true);
        this.safeSetItem(SESSION_STORAGE_KEY_LOGGED_IN, VALUE_TRUE);
        this.safeSetItem(SESSION_STORAGE_KEY_USER_NAME, data.username || username || '');
        if (data.token) {
          this.safeSetItem(SESSION_STORAGE_KEY_TOKEN, data.token);
        }
        this.safeSetItem(SESSION_STORAGE_KEY_USER_ROLE, role);

        if (role === ROLE_SORTEADOR) {
          this.router.navigate([ROUTE_DRAWS]).catch((err) => {
            console.error('AuthService: Error al navegar a sorteos:', err);
          });
        } else {
          this.router.navigate([ROUTE_DASHBOARD]).catch((err) => {
            console.error('AuthService: Error al navegar a dashboard:', err);
          });
        }
      })
    );
  }

  logout(): void {
    this.isAuthenticated.set(false);
    this.safeRemoveItem(SESSION_STORAGE_KEY_LOGGED_IN);
    this.safeRemoveItem(SESSION_STORAGE_KEY_USER_NAME);
    this.safeRemoveItem(SESSION_STORAGE_KEY_TOKEN);
    this.safeRemoveItem(SESSION_STORAGE_KEY_USER_ROLE);
    this.router.navigate([ROUTE_LOGIN]).catch((err) => {
      console.error('AuthService: Error al navegar a login:', err);
    });
  }

  getUserName(): string {
    return this.safeGetItem(SESSION_STORAGE_KEY_USER_NAME) || DEFAULT_USER_NAME;
  }

  getUserRole(): typeof ROLE_ADMIN | typeof ROLE_SORTEADOR | typeof ROLE_USUARIO {
    const savedRole = this.safeGetItem(SESSION_STORAGE_KEY_USER_ROLE);
    if (savedRole) {
      return savedRole as typeof ROLE_ADMIN | typeof ROLE_SORTEADOR | typeof ROLE_USUARIO;
    }
    const username = this.getUserName().toLowerCase().trim();
    const user = USERS_DATA_MOCK.find(
      (u) =>
        u.name.toLowerCase().trim() === username ||
        u.email.toLowerCase().trim() === username
    );
    return user ? (user.role as typeof ROLE_ADMIN | typeof ROLE_SORTEADOR | typeof ROLE_USUARIO) : ROLE_ADMIN;
  }
}


