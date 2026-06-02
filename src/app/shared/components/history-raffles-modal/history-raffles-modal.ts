import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageCropperComponent } from '../image-cropper/image-cropper';
import { RaffleDetail } from '../../../core/interfaces/api/raffle-detail.interface';

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
