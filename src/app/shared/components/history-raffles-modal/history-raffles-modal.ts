import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface RaffleDetail {
  name: string;
  foundation: string;
  startDate: string;
  endDate: string;
  category: string;
  ticketPrice: number;
  winningTicket: string;
  moneyGoal: number;
  ticketsSold: number;
  ticketsAvailable: number;
  totalCollected: number;
  photo: string;
  beneficiaryAmount: number;
  beneficiaryPercentage: number;
  winnerAmount: number;
  winnerPercentage: number;
  blogCardText: string;
  blogDetailText: string;
}

@Component({
  selector: 'app-history-raffles-modal',
  imports: [CommonModule],
  templateUrl: './history-raffles-modal.html',
  styleUrl: './history-raffles-modal.scss',
})
export class HistoryRafflesModal {
  @Input() raffleData: RaffleDetail | null = null;
  activeTab: 'card' | 'detalle' = 'card';

  setTab(tab: 'card' | 'detalle') {
    this.activeTab = tab;
  }
}
