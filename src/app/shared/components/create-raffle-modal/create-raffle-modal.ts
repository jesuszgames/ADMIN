import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MY_CATEGORIES_DATA_MOCK } from '../../../core/helpers/constants/categories-constants';
import { MY_FOUNDATIONS_DATA_MOCK } from '../../../core/helpers/constants/foundations-constans';
import type { Raffle } from '../../../features/rifas/pages/my-raffles/my-raffles';

@Component({
  selector: 'app-create-raffle-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-raffle-modal.html',
  styleUrl: './create-raffle-modal.scss',
})
export class CreateRaffleModal implements OnChanges {
  @Input() raffle: Raffle | null = null;
  @Output() save = new EventEmitter<Raffle>();

  categories = MY_CATEGORIES_DATA_MOCK.filter((c) => c.estado !== 'ELIMINADO');
  foundations = MY_FOUNDATIONS_DATA_MOCK.filter((f) => f.estado !== 'ELIMINADO');

  nombreRifa = '';
  fundacion = '';
  categoria = '';
  startDate = '';
  endDate = '';
  meta: number | null = null;
  ticketsAvailable: number | null = null;
  ticketPrice: number | null = null;
  beneficiaryPercentage: number | null = null;
  winnerPercentage: number | null = null;
  blogCardText = '';
  blogDetailText = '';
  photo = '';

  activeTab: 'card' | 'detalle' = 'card';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['raffle']) {
      this.resetForm();
    }
  }

  setTab(tab: 'card' | 'detalle') {
    this.activeTab = tab;
  }

  resetForm() {
    if (this.raffle) {
      this.nombreRifa = this.raffle.nombreRifa || '';
      this.fundacion = this.raffle.fundacion || '';
      this.categoria = this.raffle.categoria || '';
      this.startDate = this.raffle.startDate || '2026-05-10';
      this.endDate = this.raffle.endDate || '2026-05-20';
      this.meta = this.raffle.meta !== undefined && this.raffle.meta !== null ? this.raffle.meta : 10000;
      this.ticketsAvailable = this.raffle.boletosTotales || 100;
      this.ticketPrice = this.raffle.ticketPrice || 100;
      this.beneficiaryPercentage = this.raffle.beneficiaryPercentage !== undefined && this.raffle.beneficiaryPercentage !== null ? this.raffle.beneficiaryPercentage : 80;
      this.winnerPercentage = this.raffle.winnerPercentage !== undefined && this.raffle.winnerPercentage !== null ? this.raffle.winnerPercentage : 20;
      this.blogCardText = this.raffle.blogCardText || 'Ayuda a personas necesitadas.';
      this.blogDetailText = this.raffle.blogDetailText || 'Esta rifa apoya la causa social.';
      this.photo = this.raffle.photo || '';
    } else {
      this.nombreRifa = '';
      this.fundacion = this.foundations.length > 0 ? this.foundations[0].nombre : '';
      this.categoria = this.categories.length > 0 ? this.categories[0].nombre : '';
      this.startDate = '';
      this.endDate = '';
      this.meta = null;
      this.ticketsAvailable = null;
      this.ticketPrice = null;
      this.beneficiaryPercentage = null;
      this.winnerPercentage = null;
      this.blogCardText = '';
      this.blogDetailText = '';
      this.photo = '';
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.readFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
      this.readFile(event.dataTransfer.files[0]);
    }
  }

  private readFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      this.photo = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onBeneficiaryPercentageChange() {
    if (this.beneficiaryPercentage !== null) {
      if (this.beneficiaryPercentage < 0) this.beneficiaryPercentage = 0;
      if (this.beneficiaryPercentage > 100) this.beneficiaryPercentage = 100;
      this.winnerPercentage = 100 - this.beneficiaryPercentage;
    }
  }

  onWinnerPercentageChange() {
    if (this.winnerPercentage !== null) {
      if (this.winnerPercentage < 0) this.winnerPercentage = 0;
      if (this.winnerPercentage > 100) this.winnerPercentage = 100;
      this.beneficiaryPercentage = 100 - this.winnerPercentage;
    }
  }

  isFormValid(): boolean {
    return (
      this.nombreRifa.trim() !== '' &&
      this.fundacion !== '' &&
      this.categoria !== '' &&
      this.startDate !== '' &&
      this.endDate !== '' &&
      this.meta !== null &&
      this.meta > 0 &&
      this.ticketsAvailable !== null &&
      this.ticketsAvailable > 0 &&
      this.ticketPrice !== null &&
      this.ticketPrice > 0 &&
      this.beneficiaryPercentage !== null &&
      this.winnerPercentage !== null
    );
  }

  onSubmit() {
    if (!this.isFormValid()) return;

    const data: Raffle = {
      id: this.raffle?.id ?? 0,
      estado: this.raffle?.estado ?? '',
      boletosVendidos: this.raffle?.boletosVendidos ?? 0,
      recaudado: this.raffle?.recaudado ?? 0,
      ganador: this.raffle?.ganador ?? '',
      tiempoRestante: this.raffle?.tiempoRestante ?? '15 dias',
      acciones: this.raffle?.acciones ?? '',
      nombreRifa: this.nombreRifa,
      fundacion: this.fundacion,
      categoria: this.categoria,
      startDate: this.startDate,
      endDate: this.endDate,
      meta: this.meta,
      boletosTotales: this.ticketsAvailable ?? 100,
      ticketPrice: this.ticketPrice ?? 5,
      beneficiaryPercentage: this.beneficiaryPercentage ?? 80,
      winnerPercentage: this.winnerPercentage ?? 20,
      blogCardText: this.blogCardText,
      blogDetailText: this.blogDetailText,
      photo: this.photo,
      boletos: this.raffle?.boletos ?? [],
    };

    this.save.emit(data);
  }
}
