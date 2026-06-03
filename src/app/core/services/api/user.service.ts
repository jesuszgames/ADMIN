import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { User } from '../../interfaces/api/user.interface';
import { ApiResponseEnvelope } from '../../interfaces/api/api-response-envelope.interface';
import { BackendUserPayload } from '../../interfaces/api/backend-user-payload.interface';
import { PaginatedResult } from '../../interfaces/api/paginated-result.interface';
import { environment } from '../../../../environments/environment';
import {
  BACKEND_ROLE_ADMIN,
  BACKEND_ROLE_SORT,
  BACKEND_ROLE_PLAYER,
  BACKEND_STATUS_ACTIVE,
  BACKEND_STATUS_INACTIVE,
  BACKEND_STATUS_DELETED,
  ROLE_ADMIN,
  ROLE_SORTEADOR,
} from '../../helpers/global/auth.constants';
import { USER_STATUS_ACTIVE, USER_STATUS_INACTIVE, STATE_DELETED } from '../../helpers/global/user.constants';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/users`;

  getAll(page?: number, limit?: number, search?: string): Observable<{ data: User[] }> {
    let params = new HttpParams();
    if (page) params = params.set('page', page.toString());
    if (limit) params = params.set('limit', limit.toString());
    if (search) params = params.set('search', search);

    return this.http.get<ApiResponseEnvelope<PaginatedResult<User>>>(`${this.apiUrl}/get-all`, { params }).pipe(
      map((res) => ({
        ...res,
        data: res?.data?.result || [],
      })),
    );
  }

  getOne(id: string): Observable<ApiResponseEnvelope<User>> {
    return this.http.get<ApiResponseEnvelope<User>>(`${this.apiUrl}/get-one/${id}`);
  }

  create(user: Partial<User>): Observable<ApiResponseEnvelope<User>> {
    const backendUser = this.mapToBackend(user);
    return this.http.post<ApiResponseEnvelope<User>>(`${this.apiUrl}/create`, backendUser);
  }

  update(id: string, user: Partial<User>): Observable<ApiResponseEnvelope<User>> {
    const backendUser = this.mapToBackend(user);
    return this.http.put<ApiResponseEnvelope<User>>(`${this.apiUrl}/update/${id}`, backendUser);
  }

  deleteUser(id: string, deleteReason: string): Observable<ApiResponseEnvelope<User>> {
    return this.http.delete<ApiResponseEnvelope<User>>(`${this.apiUrl}/delete/${id}`, {
      body: { deleteReason },
    });
  }

  private mapToBackend(user: Partial<User>): BackendUserPayload {
    const { role, status, ...rest } = user;
    const mapped: BackendUserPayload = { ...rest };

    if (role) {
      const r = String(role).toUpperCase();
      if (r.includes(ROLE_ADMIN)) {
        mapped.role = [BACKEND_ROLE_ADMIN];
      } else if (r.includes(ROLE_SORTEADOR) || r.includes('SORT')) {
        mapped.role = [BACKEND_ROLE_SORT];
      } else {
        mapped.role = [BACKEND_ROLE_PLAYER];
      }
    }

    if (status) {
      const s = String(status).toUpperCase();
      if (s === USER_STATUS_ACTIVE || s === BACKEND_STATUS_ACTIVE) {
        mapped.status = BACKEND_STATUS_ACTIVE;
      } else if (s === USER_STATUS_INACTIVE || s === BACKEND_STATUS_INACTIVE) {
        mapped.status = BACKEND_STATUS_INACTIVE;
      } else if (s === STATE_DELETED || s === BACKEND_STATUS_DELETED) {
        mapped.status = BACKEND_STATUS_DELETED;
      }
    }

    return mapped;
  }
}
