import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Foundation } from '../../interfaces/api/foundation.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FoundationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/foundation`;

  getAll(page?: number, limit?: number, search?: string): Observable<{ data: Foundation[] }> {
    let params = new HttpParams();
    if (page) params = params.set('page', page.toString());
    if (limit) params = params.set('limit', limit.toString());
    if (search) params = params.set('search', search);

    return this.http.get<any>(`${this.apiUrl}/get-all`, { params }).pipe(
      map((res) => ({
        ...res,
        data: res?.data?.result || (Array.isArray(res?.data) ? res.data : []),
      }))
    );
  }

  getOne(id: string): Observable<{ data: Foundation }> {
    return this.http.get<{ data: Foundation }>(`${this.apiUrl}/get-one/${id}`);
  }

  create(foundation: Partial<Foundation>): Observable<{ data: Foundation }> {
    return this.http.post<{ data: Foundation }>(`${this.apiUrl}/create`, foundation);
  }

  update(id: string, foundation: Partial<Foundation>): Observable<{ data: Foundation }> {
    return this.http.put<{ data: Foundation }>(`${this.apiUrl}/update/${id}`, foundation);
  }

  deleteFoundation(id: string, deleteReason: string): Observable<{ data: Foundation }> {
    return this.http.delete<{ data: Foundation }>(`${this.apiUrl}/delete/${id}`, {
      body: { deleteReason },
    });
  }
}
