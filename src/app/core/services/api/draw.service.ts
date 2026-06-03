import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Raffle } from '../../interfaces/api/raffle.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DrawService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/draws`;

  getPendingDraws(): Observable<{ data: Raffle[] }> {
    return this.http.get<any>(`${this.apiUrl}/pending`).pipe(
      map((res) => {
        const list = res?.data?.result || (Array.isArray(res?.data) ? res.data : res || []);
        return { data: list };
      })
    );
  }

  executeDraw(raffleId: string, winnerTicketNumber: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${raffleId}/execute`, {
      winnerTicketNumber,
    });
  }
}
