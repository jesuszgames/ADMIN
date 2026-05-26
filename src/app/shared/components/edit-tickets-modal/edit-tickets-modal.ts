import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { Raffle } from '../../../features/rifas/pages/my-raffles/my-raffles';

export interface Ticket {
  numero: string;
  estado: 'disponible' | 'seleccionado' | 'ganador';
  buyer?: BuyerInfo;
}

export interface BuyerInfo {
  id: string;
  nombre: string;
  correo: string;
  telefono: string;
  fechaCompra: string;
  boletos: string[];
}

@Component({
  selector: 'app-edit-tickets-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-tickets-modal.html',
  styleUrl: './edit-tickets-modal.scss',
})
export class EditTicketsModal implements OnChanges {
  @Input() raffle: Raffle | null = null;
  @Output() save = new EventEmitter<Raffle>();

  boletos: Ticket[] = [];
  selectedTicket: Ticket | null = null;
  buscarIdCompra = '';

  showOptions = false;

  nombreComprador = '';
  boletosComprados: number | null = null;
  correoElectronico = '';
  todosNumerosAsociados = '';
  numeroTelefono = '';
  fechaCompra = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['raffle']) {
      this.initializeTickets();
    }
  }

  toggleOptions() {
    this.showOptions = !this.showOptions;
  }

  initializeTickets() {
    this.selectedTicket = null;
    this.buscarIdCompra = '';
    this.clearForm();

    const raffle = this.raffle;
    if (!raffle) {
      this.boletos = [];
      return;
    }

    if (raffle.boletos && Array.isArray(raffle.boletos)) {
      this.boletos = JSON.parse(JSON.stringify(raffle.boletos));
      this.boletos.forEach((b) => {
        if (b.estado === 'ganador') {
          b.estado = 'seleccionado';
        }
      });
      return;
    }

    const count = raffle.boletosTotales || 100;

    const mockBuyer: BuyerInfo = {
      id: 'COMPRA-123',
      nombre: raffle.ganadorName || 'Paco Briones Macias',
      correo: raffle.ganadorEmail || 'example@gmail.com',
      telefono: raffle.ganadorPhone || '0998452318',
      fechaCompra: '12/05/2026',
      boletos: ['05', '07', '14'],
    };

    this.boletos = Array.from({ length: count }, (_, i) => {
      const numStr = (i + 1).toString().padStart(2, '0');
      let estado: 'disponible' | 'seleccionado' | 'ganador' = 'disponible';
      let buyer: BuyerInfo | undefined;

      if (mockBuyer.boletos.includes(numStr)) {
        estado = 'seleccionado';
        buyer = mockBuyer;
      } else if (numStr === raffle.ganador && raffle.ganador) {
        estado = 'seleccionado';
        buyer = {
          id: 'COMPRA-123',
          nombre: raffle.ganadorName || 'Ganador Oficial',
          correo: raffle.ganadorEmail || 'ganador@gmail.com',
          telefono: raffle.ganadorPhone || '0999999999',
          fechaCompra: '14/05/2026',
          boletos: [numStr],
        };
      }

      return { numero: numStr, estado, buyer };
    });
  }

  selectTicket(ticket: Ticket) {
    this.selectedTicket = ticket;
    if (ticket.buyer) {
      this.loadBuyer(ticket.buyer);
    } else {
      this.clearForm();
    }
  }

  loadBuyer(buyer: BuyerInfo) {
    this.nombreComprador = buyer.nombre;
    this.boletosComprados = buyer.boletos.length;
    this.correoElectronico = buyer.correo;
    this.todosNumerosAsociados = buyer.boletos.map((num) => `[${num}]`).join(' ');
    this.numeroTelefono = buyer.telefono;
    this.fechaCompra = buyer.fechaCompra;
  }

  clearForm() {
    this.nombreComprador = '';
    this.boletosComprados = null;
    this.correoElectronico = '';
    this.todosNumerosAsociados = '';
    this.numeroTelefono = '';
    this.fechaCompra = '';
    this.showOptions = false;
  }

  buscarCompra() {
    const query = this.buscarIdCompra.toUpperCase().trim();
    if (!query) {
      this.selectedTicket = null;
      this.clearForm();
      return;
    }

    const found = this.boletos.find((b) => {
      if (!b.buyer) return false;
      const id = (b.buyer.id || '').toUpperCase();
      const nombre = (b.buyer.nombre || '').toUpperCase();
      const correo = (b.buyer.correo || '').toUpperCase();
      const telefono = b.buyer.telefono || '';
      return (
        id.includes(query) ||
        nombre.includes(query) ||
        correo.includes(query) ||
        telefono.includes(query)
      );
    });

    if (found) {
      this.selectTicket(found);
    } else {
      this.selectedTicket = null;
      this.clearForm();
    }
  }

  desvincularSeleccionado() {
    if (!this.selectedTicket || !this.selectedTicket.buyer) return;

    const buyer = this.selectedTicket.buyer;
    const numToUnlink = this.selectedTicket.numero;

    buyer.boletos = buyer.boletos.filter((num) => num !== numToUnlink);

    this.selectedTicket.estado = 'disponible';
    delete this.selectedTicket.buyer;
    if (buyer.boletos.length > 0) {
      this.boletos.forEach((b) => {
        if (b.buyer && b.buyer.id === buyer.id) {
          b.buyer = buyer;
          if (b.numero === numToUnlink) {
            b.estado = 'disponible';
            delete b.buyer;
          }
        }
      });
      this.loadBuyer(buyer);
    } else {
      this.clearForm();
      this.selectedTicket = null;
    }
    this.showOptions = false;
  }

  desvincularTodos() {
    if (!this.selectedTicket || !this.selectedTicket.buyer) return;

    const buyerId = this.selectedTicket.buyer.id;
    this.boletos.forEach((b) => {
      if (b.buyer && b.buyer.id === buyerId) {
        b.estado = 'disponible';
        delete b.buyer;
      }
    });

    this.clearForm();
    this.selectedTicket = null;
    this.showOptions = false;
  }

  onSubmit() {
    const raffle = this.raffle;
    if (!raffle) return;

    const soldCount = this.boletos.filter((b) => b.estado !== 'disponible').length;
    const newRecaudado = soldCount * (raffle.ticketPrice || 5);

    const updatedRaffle: Raffle = {
      ...raffle,
      boletos: this.boletos,
      boletosVendidos: soldCount,
      recaudado: newRecaudado,
      boletosVendidosStr: `${soldCount}/${raffle.boletosTotales || 100}`,
      recaudadoStr: raffle.meta ? `${newRecaudado}/${raffle.meta} $` : `${newRecaudado}$`,
    };

    this.save.emit(updatedRaffle);
  }
}
