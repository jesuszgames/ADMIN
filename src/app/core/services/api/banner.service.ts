import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Banner {
  _id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  raffleId?: any;
  order: number;
  status: string;
  deleteReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BannerResponse {
  data: {
    result: Banner[];
    totalCount: number;
    limit: number;
    page: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: number | null;
    prevPage: number | null;
  };
}

export interface SingleBannerResponse {
  data: Banner;
}

@Injectable({
  providedIn: 'root',
})
export class BannerService {
  private apiUrl = `${environment.apiUrl}/banners`;

  constructor(private http: HttpClient) {}

  getAll(
    page: number = 1,
    limit: number = 10,
    search: string = '',
    status: string = ''
  ): Observable<BannerResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }
    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<BannerResponse>(`${this.apiUrl}/get-all`, { params });
  }

  getActive(): Observable<BannerResponse> {
    return this.http.get<BannerResponse>(`${this.apiUrl}/get-active`);
  }

  create(formData: FormData): Observable<SingleBannerResponse> {
    return this.http.post<SingleBannerResponse>(
      `${this.apiUrl}/create`,
      formData
    );
  }

  update(id: string, formData: FormData): Observable<SingleBannerResponse> {
    return this.http.put<SingleBannerResponse>(
      `${this.apiUrl}/update/${id}`,
      formData
    );
  }

  delete(id: string, deleteReason?: string): Observable<SingleBannerResponse> {
    return this.http.delete<SingleBannerResponse>(
      `${this.apiUrl}/delete/${id}`,
      { body: { deleteReason } }
    );
  }
}
