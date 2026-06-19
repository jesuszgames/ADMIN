import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Raffle } from '../../interfaces/api/raffle.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RaffleService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/raffles`;

  getAll(
    page?: number,
    limit?: number,
    search?: string,
    status?: string,
    drawMethod?: string,
    filter?: string,
    sort?: string,
    category?: string,
    foundation?: string,
  ): Observable<{ data: Raffle[]; totalCount: number }> {
    let params = new HttpParams();
    if (page) params = params.set('page', page.toString());
    if (limit) params = params.set('limit', limit.toString());
    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);
    if (drawMethod) params = params.set('drawMethod', drawMethod);
    if (filter) params = params.set('filter', filter);
    if (sort) params = params.set('sort', sort);
    if (category) params = params.set('category', category);
    if (foundation) params = params.set('foundation', foundation);

    interface GetRafflesResponse {
      data?: {
        result?: Raffle[];
        totalCount?: number;
      } | Raffle[];
    }

    return this.http.get<GetRafflesResponse>(`${this.apiUrl}/get-all`, { params }).pipe(
      map((res) => {
        const list = res?.data && !Array.isArray(res.data) && res.data.result ? res.data.result : (Array.isArray(res?.data) ? res.data : []);
        const total = res?.data && !Array.isArray(res.data) && res.data.totalCount !== undefined ? res.data.totalCount : list.length;
        return { data: list, totalCount: total };
      })
    );
  }

  getDashboardMetrics(): Observable<{
    data: {
      totalCollected: number;
      totalBeneficiaries: number;
      totalWinners: number;
      totalActive: number;
      totalNoTickets: number;
      totalFinished: number;
    }
  }> {
    return this.http.get<{
      data: {
        totalCollected: number;
        totalBeneficiaries: number;
        totalWinners: number;
        totalActive: number;
        totalNoTickets: number;
        totalFinished: number;
      }
    }>(`${this.apiUrl}/dashboard-metrics`);
  }

  getOne(id: string): Observable<{ data: Raffle }> {
    return this.http.get<{ data: Raffle }>(`${this.apiUrl}/get-one/${id}`);
  }

  private buildFormData(raffle: Partial<Raffle>): FormData {
    const formData = new FormData();
    Object.keys(raffle).forEach((key) => {
      const val = (raffle as Record<string, unknown>)[key];
      if (
        key !== 'photo' &&
        key !== 'banner' &&
        key !== 'tickets' &&
        key !== 'unlinks' &&
        val !== undefined &&
        val !== null
      ) {
        formData.append(key, String(val));
      }
    });

    if (raffle.photo) {
      const photoVal = raffle.photo as unknown;
      if (photoVal instanceof Blob) {
        const ext = photoVal.type.split('/')[1] || 'webp';
        formData.append('photo', photoVal, `photo-${Date.now()}.${ext}`);
      } else if (typeof raffle.photo === 'string') {
        formData.append('photo', raffle.photo);
      }
    }

    if (raffle.banner) {
      const bannerVal = raffle.banner as unknown;
      if (bannerVal instanceof Blob) {
        const ext = bannerVal.type.split('/')[1] || 'webp';
        formData.append('banner', bannerVal, `banner-${Date.now()}.${ext}`);
      } else if (typeof raffle.banner === 'string') {
        formData.append('banner', raffle.banner);
      }
    }
    return formData;
  }

  create(raffle: Partial<Raffle>): Observable<{ data: Raffle }> {
    const formData = this.buildFormData(raffle);
    return this.http.post<{ data: Raffle }>(`${this.apiUrl}/create`, formData);
  }

  update(id: string, raffle: Partial<Raffle>): Observable<{ data: Raffle }> {
    const formData = this.buildFormData(raffle);
    return this.http.put<{ data: Raffle }>(`${this.apiUrl}/update/${id}`, formData);
  }

  deleteRaffle(id: string, deleteReason: string): Observable<{ data: Raffle }> {
    return this.http.delete<{ data: Raffle }>(`${this.apiUrl}/delete/${id}`, {
      body: { deleteReason },
    });
  }
}
