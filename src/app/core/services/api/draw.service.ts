import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Raffle } from '../../interfaces/api/raffle.interface';
import { Ticket } from '../../interfaces/api/ticket.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DrawService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/draws`;

  getPendingDraws(): Observable<{ data: Raffle[] }> {
    interface PendingResponse {
      data?: {
        result?: Raffle[];
      } | Raffle[];
    }
    return this.http.get<PendingResponse>(`${this.apiUrl}/pending?_cb=${new Date().getTime()}`).pipe(
      map((res) => {
        const data = res?.data;
        let list: Raffle[] = [];
        if (data) {
          if (Array.isArray(data)) {
            list = data;
          } else if (data.result) {
            list = data.result;
          }
        } else if (Array.isArray(res)) {
          list = res;
        }
        return { data: list };
      })
    );
  }

  executeDraw(raffleId: string, winnerTicketNumber: string): Observable<unknown> {
    return this.http.post<unknown>(`${this.apiUrl}/${raffleId}/execute`, {
      winnerTicketNumber,
    });
  }

  getTicketsByRaffle(raffleId: string, page?: number, limit?: number, search?: string): Observable<{ data: Ticket[], totalCount?: number, currentPage?: number }> {
    let url = `${this.apiUrl}/${raffleId}/tickets?`;
    if (page !== undefined) url += `page=${page}&`;
    if (limit !== undefined) url += `limit=${limit}&`;
    if (search !== undefined) url += `search=${encodeURIComponent(search)}&`;
    interface TicketsResponse {
      data?: {
        result?: Ticket[];
        totalCount?: number;
        page?: number;
      } | Ticket[];
    }
    return this.http.get<TicketsResponse>(url).pipe(
      map((res) => {
        const list = res?.data && !Array.isArray(res.data) && res.data.result ? res.data.result : (Array.isArray(res?.data) ? res.data : []);
        const totalCount = res?.data && !Array.isArray(res.data) ? res.data.totalCount : undefined;
        const currentPage = res?.data && !Array.isArray(res.data) ? res.data.page : undefined;
        return { 
          data: list,
          totalCount,
          currentPage
        };
      })
    );
  }
}
