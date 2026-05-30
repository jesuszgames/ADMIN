import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnlinkLog } from '../../../core/interfaces/api/raffle.interface';
import { ImageCropperComponent } from '../image-cropper/image-cropper';

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
  drawMethod?: 'AUTOMATICO' | 'MANUAL';
  deleteReason?: string;
  unlinks?: UnlinkLog[];
}

@Component({
  selector: 'app-history-raffles-modal',
  standalone: true,
  imports: [CommonModule, ImageCropperComponent],
  templateUrl: './history-raffles-modal.html',
  styleUrl: './history-raffles-modal.scss',
})
export class HistoryRafflesModal {
  @Input() raffleData: RaffleDetail | null = null;
  activeTab: 'card' | 'detalle' | 'desvinculaciones' = 'card';

  setTab(tab: 'card' | 'detalle' | 'desvinculaciones') {
    this.activeTab = tab;
  }
}
