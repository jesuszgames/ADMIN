import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
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
  @Output() closed = new EventEmitter<void>();

  currentPage = 1;
  pageSize = 100;
  pagedTickets: Ticket[] = [];
  loading = false;
  showSkeleton = true;

  onModalClosed() {
    this.closed.emit();
  }

  get totalPages(): number {
    if (!this.ticketData || !this.ticketData.tickets) return 0;
    return Math.ceil(this.ticketData.tickets.length / this.pageSize);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ticketData']) {
      const currentVal = changes['ticketData'].currentValue;
      if (!currentVal) {
        this.pagedTickets = [];
        this.showSkeleton = true;
        this.loading = true;
      } else {
        this.currentPage = 1;
        this.updatePagedTickets();
        this.showSkeleton = false;
        this.loading = false;
      }
    }
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.triggerLoading(() => this.updatePagedTickets());
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.triggerLoading(() => this.updatePagedTickets());
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.triggerLoading(() => this.updatePagedTickets());
    }
  }

  triggerLoading(callback: () => void): void {
    this.loading = true;
    setTimeout(() => {
      callback();
      this.loading = false;
    }, 200);
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
