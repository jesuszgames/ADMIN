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

  getTicketsByRaffle(raffleId: string): Observable<{ data: Ticket[] }> {
    return this.http.get<any>(`${this.apiUrl}/raffle/${raffleId}`).pipe(
      map((res) => {
        const list = res?.data?.result || (Array.isArray(res?.data) ? res.data : []);
        return { data: list };
      })
    );
  }

  unlinkTicket(raffleId: string, ticketNumber: string, reason: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/unlink`, {
      raffleId,
      ticketNumber,
      reason,
    });
  }
}
