import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Ticket } from '../../../core/interfaces/api/ticket.interface';


export interface TicketHistoryData {
  winnerName: string;
  ticketsPurchased: number;
  associatedNumbers: string;
  email: string;
  winnerTicket: string;
  phone: string;
  lastPurchaseDate: string;
  tickets: Ticket[];
}

@Component({
  selector: 'app-history-ticket-model',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history-ticket-model.html',
  styleUrl: './history-ticket-model.scss',
})
export class HistoryTicketModel {
  @Input() ticketData: TicketHistoryData | null = null;
}
