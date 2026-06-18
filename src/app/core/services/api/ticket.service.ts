import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Ticket } from '../../interfaces/api/ticket.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/tickets`;

  getTicketsByRaffle(raffleId: string, page?: number, limit?: number): Observable<{ data: Ticket[], totalCount?: number, currentPage?: number }> {
    const body: any = { raffleId };
    if (page !== undefined) body.page = page;
    if (limit !== undefined) body.limit = limit;
    return this.http.post<any>(`${this.apiUrl}/raffle`, body).pipe(
      map((res) => {
        const list = res?.data?.result || (Array.isArray(res?.data) ? res.data : []);
        return { 
          data: list,
          totalCount: res?.data?.totalCount,
          currentPage: res?.data?.page
        };
      })
    );
  }

  getUserTicketsInRaffle(raffleId: string, userId: string): Observable<{ data: string[] }> {
    return this.http.get<any>(`${this.apiUrl}/user-tickets?raffleId=${raffleId}&userId=${userId}`);
  }

  unlinkTicket(raffleId: string, ticketNumber: string, reason: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/unlink`, {
      raffleId,
      ticketNumber,
      reason,
    });
  }

  unlinkBulk(raffleId: string, ticketNumbers: string[], reason: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/unlink-bulk`, {
      raffleId,
      ticketNumbers,
      reason,
    });
  }

  getUnlinkedLogs(raffleId?: string, page?: number, limit?: number): Observable<any> {
    let url = `${this.apiUrl}/unlinked?`;
    if (raffleId) url += `raffleId=${raffleId}&`;
    if (page !== undefined) url += `page=${page}&`;
    if (limit !== undefined) url += `limit=${limit}&`;
    return this.http.get<any>(url);
  }
}
