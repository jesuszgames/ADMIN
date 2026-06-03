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

  private buildFormData(foundation: Partial<Foundation>): FormData {
    const formData = new FormData();
    Object.keys(foundation).forEach((key) => {
      const val = (foundation as any)[key];
      if (key !== 'photo' && val !== undefined && val !== null) {
        formData.append(key, val.toString());
      }
    });

    if (foundation.photo) {
      if (foundation.photo instanceof Blob) {
        const ext = foundation.photo.type.split('/')[1] || 'webp';
        formData.append('photo', foundation.photo, `photo-${Date.now()}.${ext}`);
      } else if (typeof foundation.photo === 'string') {
        formData.append('photo', foundation.photo);
      }
    }
    return formData;
  }

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
    const formData = this.buildFormData(foundation);
    return this.http.post<{ data: Foundation }>(`${this.apiUrl}/create`, formData);
  }

  update(id: string, foundation: Partial<Foundation>): Observable<{ data: Foundation }> {
    const formData = this.buildFormData(foundation);
    return this.http.put<{ data: Foundation }>(`${this.apiUrl}/update/${id}`, formData);
  }

  deleteFoundation(id: string, deleteReason: string): Observable<{ data: Foundation }> {
    return this.http.delete<{ data: Foundation }>(`${this.apiUrl}/delete/${id}`, {
      body: { deleteReason },
    });
  }
}
