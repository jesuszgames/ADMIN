import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Category } from '../../interfaces/api/category.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/category`;

  getAll(page?: number, limit?: number, search?: string, status?: string): Observable<{ data: Category[]; totalCount: number; page: number; limit: number }> {
    let params = new HttpParams();
    if (page) params = params.set('page', page.toString());
    if (limit) params = params.set('limit', limit.toString());
    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);

    interface GetAllResponse {
      data?: {
        result?: Category[];
        totalCount?: number;
        page?: number;
        limit?: number;
      } | Category[];
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

  getOne(id: string): Observable<{ data: Category }> {
    return this.http.get<{ data: Category }>(`${this.apiUrl}/get-one/${id}`);
  }

  create(category: Partial<Category>): Observable<{ data: Category }> {
    return this.http.post<{ data: Category }>(`${this.apiUrl}/create`, category);
  }

  update(id: string, category: Partial<Category>): Observable<{ data: Category }> {
    return this.http.put<{ data: Category }>(`${this.apiUrl}/update/${id}`, category);
  }

  deleteCategory(id: string, deleteReason: string): Observable<{ data: Category }> {
    return this.http.delete<{ data: Category }>(`${this.apiUrl}/delete/${id}`, {
      body: { deleteReason },
    });
  }
}
