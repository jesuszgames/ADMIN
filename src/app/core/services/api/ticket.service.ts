import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Ticket } from '../../interfaces/api/ticket.interface';
import { environment } from '../../../../environments/environment';

export interface BackendUnlinkLog {
  number: string;
  userId?: {
    name?: string;
    username?: string;
  } | string;
  purchaseId: string;
  reason: string;
  date: string;
}

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/tickets`;

  getTicketsByRaffle(raffleId: string, page?: number, limit?: number): Observable<{ data: Ticket[], totalCount?: number, currentPage?: number }> {
    const body: Record<string, unknown> = { raffleId };
    if (page !== undefined) body['page'] = page;
    if (limit !== undefined) body['limit'] = limit;
    interface GetTicketsResponse {
      data?: {
        result?: Ticket[];
        totalCount?: number;
        page?: number;
      } | Ticket[];
    }
    return this.http.post<GetTicketsResponse>(`${this.apiUrl}/raffle`, body).pipe(
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

  getUserTicketsInRaffle(raffleId: string, userId: string): Observable<{ data: string[] }> {
    return this.http.get<{ data: string[] }>(`${this.apiUrl}/user-tickets?raffleId=${raffleId}&userId=${userId}`);
  }

  unlinkTicket(raffleId: string, ticketNumber: string, reason: string): Observable<unknown> {
    return this.http.post<unknown>(`${this.apiUrl}/unlink`, {
      raffleId,
      ticketNumber,
      reason,
    });
  }

  unlinkBulk(raffleId: string, ticketNumbers: string[], reason: string): Observable<unknown> {
    return this.http.post<unknown>(`${this.apiUrl}/unlink-bulk`, {
      raffleId,
      ticketNumbers,
      reason,
    });
  }

  getUnlinkedLogs(raffleId?: string, page?: number, limit?: number): Observable<{ data: { result?: BackendUnlinkLog[]; totalCount?: number } | BackendUnlinkLog[] }> {
    let url = `${this.apiUrl}/unlinked?`;
    if (raffleId) url += `raffleId=${raffleId}&`;
    if (page !== undefined) url += `page=${page}&`;
    if (limit !== undefined) url += `limit=${limit}&`;
    return this.http.get<{ data: { result?: BackendUnlinkLog[]; totalCount?: number } | BackendUnlinkLog[] }>(url);
  }
}
