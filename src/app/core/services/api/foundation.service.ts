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
      const val = (foundation as Record<string, unknown>)[key];
      if (key !== 'photo' && val !== undefined && val !== null) {
        formData.append(key, String(val));
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

  getAll(page?: number, limit?: number, search?: string, status?: string): Observable<{ data: Foundation[]; totalCount: number; page: number; limit: number }> {
    let params = new HttpParams();
    if (page) params = params.set('page', page.toString());
    if (limit) params = params.set('limit', limit.toString());
    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);

    interface GetAllResponse {
      data?: {
        result?: Foundation[];
        totalCount?: number;
        page?: number;
        limit?: number;
      } | Foundation[];
    }

    return this.http.get<GetAllResponse>(`${this.apiUrl}/get-all`, { params }).pipe(
      map((res) => {
        const dataArray = res?.data && !Array.isArray(res.data) && res.data.result ? res.data.result : (Array.isArray(res?.data) ? res.data : []);
        const totalCount = res?.data && !Array.isArray(res.data) && res.data.totalCount !== undefined ? res.data.totalCount : dataArray.length;
        const resPage = res?.data && !Array.isArray(res.data) && res.data.page !== undefined ? res.data.page : 1;
        const resLimit = res?.data && !Array.isArray(res.data) && res.data.limit !== undefined ? res.data.limit : dataArray.length;
        return {
          data: dataArray,
          totalCount,
          page: resPage,
          limit: resLimit,
        };
      })
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

  getActive(page?: number, limit?: number, search?: string): Observable<{ data: Foundation[]; totalCount: number }> {
    let params = new HttpParams();
    if (page) params = params.set('page', page.toString());
    if (limit) params = params.set('limit', limit.toString());
    if (search) params = params.set('search', search);

    return this.http.get<any>(`${this.apiUrl}/get-active`, { params }).pipe(
      map((res) => {
        let dataArray: Foundation[] = [];
        let totalCount = 0;
        if (Array.isArray(res)) {
          dataArray = res;
          totalCount = res.length;
        } else if (res) {
          if (Array.isArray(res.data)) {
            dataArray = res.data;
            totalCount = res.data.length;
          } else if (res.data && Array.isArray(res.data.data)) {
            dataArray = res.data.data;
            totalCount = res.data.totalCount !== undefined ? res.data.totalCount : res.data.data.length;
          } else if (res.data && Array.isArray(res.data.result)) {
            dataArray = res.data.result;
            totalCount = res.data.totalCount !== undefined ? res.data.totalCount : res.data.result.length;
          }
        }
        return { data: dataArray, totalCount };
      })
    );
  }
}
