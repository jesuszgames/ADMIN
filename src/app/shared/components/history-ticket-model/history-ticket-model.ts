import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketHistoryData } from '../../../core/interfaces/api/ticket-history-data.interface';

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
