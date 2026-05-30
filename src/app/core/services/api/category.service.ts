import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../../interfaces/api/category.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/category`;

  getAll(): Observable<{ data: Category[] }> {
    return this.http.get<{ data: Category[] }>(`${this.apiUrl}/get-all`);
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
