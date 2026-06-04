import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, of, catchError } from 'rxjs';
import { Raffle } from '../../interfaces/api/raffle.interface';
import { environment } from '../../../../environments/environment';
import { ApiResponseEnvelope } from '../../interfaces/api/api-response-envelope.interface';
import { MY_RAFFLES_DATA_MOCK } from '../../helpers/global/raffle.constants';

@Injectable({
  providedIn: 'root',
})
export class RaffleService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/raffles`;

  getAll(page?: number, limit?: number, search?: string): Observable<{ data: Raffle[] }> {
    let params = new HttpParams();
    if (page) params = params.set('page', page.toString());
    if (limit) params = params.set('limit', limit.toString());
    if (search) params = params.set('search', search);

    return this.http.get<any>(`${this.apiUrl}`, { params }).pipe(
      map((res) => {
        const list = res?.data?.result || (Array.isArray(res?.data) ? res.data : []);
        return { data: list };
      }),
      catchError((err) => {
        console.warn('RaffleService: API failed or endpoint missing. Falling back to mock data.', err);
        return of({ data: MY_RAFFLES_DATA_MOCK });
      })
    );
  }

  getOne(id: string): Observable<{ data: Raffle }> {
    return this.http.get<{ data: Raffle }>(`${this.apiUrl}/${id}`).pipe(
      catchError((err) => {
        const mock = MY_RAFFLES_DATA_MOCK.find((r) => r._id === id) || MY_RAFFLES_DATA_MOCK[0];
        return of({ data: mock });
      })
    );
  }

  private buildFormData(raffle: Partial<Raffle>): FormData {
    const formData = new FormData();
    Object.keys(raffle).forEach((key) => {
      const val = (raffle as any)[key];
      if (
        key !== 'photo' &&
        key !== 'tickets' &&
        key !== 'unlinks' &&
        val !== undefined &&
        val !== null
      ) {
        formData.append(key, val.toString());
      }
    });

    if (raffle.photo) {
      const photoVal = raffle.photo as any;
      if (photoVal instanceof Blob) {
        const ext = photoVal.type.split('/')[1] || 'webp';
        formData.append('photo', photoVal, `photo-${Date.now()}.${ext}`);
      } else if (typeof raffle.photo === 'string') {
        formData.append('photo', raffle.photo);
      }
    }
    return formData;
  }

  create(raffle: Partial<Raffle>): Observable<{ data: Raffle }> {
    const formData = this.buildFormData(raffle);
    return this.http.post<{ data: Raffle }>(`${this.apiUrl}`, formData).pipe(
      catchError((err) => {
        const mock: Raffle = {
          _id: `mock-${Date.now()}`,
          title: raffle.title || 'Nueva Rifa',
          foundation: raffle.foundation || 'Fundación',
          category: raffle.category || 'Categoría',
          soldTickets: 0,
          totalTickets: raffle.totalTickets || 100,
          collected: 0,
          goal: raffle.goal || 1000,
          remainingTime: '30 días',
          ...raffle,
        } as Raffle;
        return of({ data: mock });
      })
    );
  }

  update(id: string, raffle: Partial<Raffle>): Observable<{ data: Raffle }> {
    const formData = this.buildFormData(raffle);
    return this.http.put<{ data: Raffle }>(`${this.apiUrl}/${id}`, formData).pipe(
      catchError((err) => {
        const mock = {
          ...MY_RAFFLES_DATA_MOCK.find((r) => r._id === id),
          ...raffle,
        } as Raffle;
        return of({ data: mock });
      })
    );
  }

  deleteRaffle(id: string, deleteReason: string): Observable<{ data: Raffle }> {
    return this.http.delete<{ data: Raffle }>(`${this.apiUrl}/${id}`, {
      body: { deleteReason },
    }).pipe(
      catchError((err) => {
        const mock = MY_RAFFLES_DATA_MOCK.find((r) => r._id === id) || MY_RAFFLES_DATA_MOCK[0];
        return of({ data: mock });
      })
    );
  }
}
