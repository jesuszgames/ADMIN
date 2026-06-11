import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Raffle, UnlinkLog } from '../../../core/interfaces/api/raffle.interface';

@Component({
  selector: 'app-unlink-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './unlink-logs.html',
  styleUrl: './unlink-logs.scss',
})
export class UnlinkLogs {
  @Input() raffleData: Raffle | null = null;
  searchTerm: string = '';

  get filteredLogs(): UnlinkLog[] {
    if (!this.raffleData || !this.raffleData.unlinks) return [];
    if (!this.searchTerm.trim()) return this.raffleData.unlinks;

    const term = this.searchTerm.toLowerCase().trim();
    return this.raffleData.unlinks.filter(log =>
      (log.number && log.number.toLowerCase().includes(term)) ||
      (log.user && log.user.toLowerCase().includes(term)) ||
      (log.purchaseId && log.purchaseId.toLowerCase().includes(term)) ||
      (log.reason && log.reason.toLowerCase().includes(term)) ||
      (log.date && log.date.toLowerCase().includes(term))
    );
  }

  get totalUnlinks(): number {
    return this.raffleData?.unlinks?.length || 0;
  }

  get uniqueUsersCount(): number {
    if (!this.raffleData || !this.raffleData.unlinks) return 0;
    const users = new Set(this.raffleData.unlinks.map(log => log.user));
    return users.size;
  }

  getVentasPercentage(): number {
    if (!this.raffleData || !this.raffleData.totalTickets) return 0;
    return Math.round((this.raffleData.soldTickets / this.raffleData.totalTickets) * 100);
  }

  getStatusClass(): string {
    if (!this.raffleData) return '';
    switch (this.raffleData.status?.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-success bg-opacity-20 text-success border border-success border-opacity-20';
      case 'FINISHED':
        return 'bg-primary bg-opacity-20 text-primary border border-primary border-opacity-20';
      case 'DELETED':
        return 'bg-danger bg-opacity-20 text-danger border border-danger border-opacity-20';
      default:
        return 'bg-secondary bg-opacity-20 text-secondary border border-secondary border-opacity-20';
    }
  }
}
