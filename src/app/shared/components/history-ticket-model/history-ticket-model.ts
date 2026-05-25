import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Ticket {
  numero: string;
  estado: 'disponible' | 'seleccionado' | 'ganador';
}

export interface TicketHistoryData {
  nombreGanador: string;
  boletosComprados: number;
  numerosAsociados: string;
  correo: string;
  boletoGanador: string;
  telefono: string;
  fechaUltimaCompra: string;
  boletos: Ticket[];
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
