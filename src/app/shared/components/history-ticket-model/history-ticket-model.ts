import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketHistoryData } from '../../../core/interfaces/api/ticket-history-data.interface';
import { Ticket } from '../../../core/interfaces/api/ticket.interface';

@Component({
  selector: 'app-history-ticket-model',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history-ticket-model.html',
  styleUrl: './history-ticket-model.scss',
})
export class HistoryTicketModel implements OnChanges {
  @Input() ticketData: TicketHistoryData | null = null;

  currentPage = 1;
  pageSize = 100;
  pagedTickets: Ticket[] = [];

  get totalPages(): number {
    if (!this.ticketData || !this.ticketData.tickets) return 0;
    return Math.ceil(this.ticketData.tickets.length / this.pageSize);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ticketData']) {
      this.currentPage = 1;
      this.updatePagedTickets();
    }
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePagedTickets();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagedTickets();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagedTickets();
    }
  }

  updatePagedTickets(): void {
    if (!this.ticketData || !this.ticketData.tickets) {
      this.pagedTickets = [];
      return;
    }
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedTickets = this.ticketData.tickets.slice(startIndex, endIndex);
  }
}
