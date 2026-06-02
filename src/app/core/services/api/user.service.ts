import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { User } from '../../interfaces/api/user.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/adminpanel/users`;

  getAll(page?: number, limit?: number, search?: string): Observable<{ data: User[] }> {
    let params = new HttpParams();
    if (page) params = params.set('page', page.toString());
    if (limit) params = params.set('limit', limit.toString());
    if (search) params = params.set('search', search);

    return this.http.get<any>(`${this.apiUrl}/get-all`, { params }).pipe(
      map((res) => ({
        ...res,
        data: res?.data?.result || (Array.isArray(res?.data) ? res.data : []),
      })),
    );
  }

  getOne(id: string): Observable<{ data: User }> {
    return this.http.get<{ data: User }>(`${this.apiUrl}/get-one/${id}`);
  }

  create(user: Partial<User>): Observable<{ data: User }> {
    const backendUser = this.mapToBackend(user);
    return this.http.post<{ data: User }>(`${this.apiUrl}/create`, backendUser);
  }

  update(id: string, user: Partial<User>): Observable<{ data: User }> {
    const backendUser = this.mapToBackend(user);
    return this.http.put<{ data: User }>(`${this.apiUrl}/update/${id}`, backendUser);
  }

  deleteUser(id: string, deleteReason: string): Observable<{ data: User }> {
    return this.http.delete<{ data: User }>(`${this.apiUrl}/delete/${id}`, {
      body: { deleteReason },
    });
  }

  private mapToBackend(user: Partial<User>): any {
    const mapped: any = { ...user };
    if (mapped.role) {
      const r = String(mapped.role).toUpperCase();
      if (r.includes('ADMIN')) {
        mapped.role = ['admin'] as any;
      } else if (r.includes('SORTEADOR') || r.includes('SORT')) {
        mapped.role = ['sort'] as any;
      } else {
        mapped.role = ['player'] as any;
      }
    }
    if (mapped.status) {
      const s = String(mapped.status).toUpperCase();
      if (s === 'ACTIVO' || s === 'ACTIVE') {
        mapped.status = 'ACTIVE';
      } else if (s === 'INACTIVO' || s === 'INACTIVE') {
        mapped.status = 'INACTIVE';
      } else if (s === 'ELIMINADO' || s === 'DELETED') {
        mapped.status = 'DELETED';
      }
    }
    return mapped;
  }
}
