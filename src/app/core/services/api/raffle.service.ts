import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Raffle } from '../../interfaces/api/raffle.interface';
import { environment } from '../../../../environments/environment';
import { ApiResponseEnvelope } from '../../interfaces/api/api-response-envelope.interface';

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
      })
    );
  }

  getOne(id: string): Observable<{ data: Raffle }> {
    return this.http.get<{ data: Raffle }>(`${this.apiUrl}/${id}`);
  }

  create(raffle: Partial<Raffle>): Observable<{ data: Raffle }> {
    return this.http.post<{ data: Raffle }>(`${this.apiUrl}`, raffle);
  }

  update(id: string, raffle: Partial<Raffle>): Observable<{ data: Raffle }> {
    return this.http.put<{ data: Raffle }>(`${this.apiUrl}/${id}`, raffle);
  }

  deleteRaffle(id: string, deleteReason: string): Observable<{ data: Raffle }> {
    return this.http.delete<{ data: Raffle }>(`${this.apiUrl}/${id}`, {
      body: { deleteReason },
    });
  }
}
