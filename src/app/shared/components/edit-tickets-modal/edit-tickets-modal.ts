import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/api/auth.service';
import { Raffle } from '../../../core/interfaces/api/raffle.interface';
import { Ticket, BuyerInfo } from '../../../core/interfaces/api/ticket.interface';
import {
  DEFAULT_RAFFLE_TICKET_PRICE,
  DEFAULT_RAFFLE_TICKETS_TOTAL,
} from '../../../core/helpers/global/raffle.constants';

@Component({
  selector: 'app-edit-tickets-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-tickets-modal.html',
  styleUrl: './edit-tickets-modal.scss',
})
export class EditTicketsModal implements OnChanges {
  @Input() raffle: Raffle | null = null;
  @Input() mode: 'rifas' | 'sorteos' = 'rifas';
  @Output() save = new EventEmitter<Raffle>();

  private readonly authService = inject(AuthService);
  userRole = this.authService.getUserRole();

  tickets: Ticket[] = [];
  selectedTicket: Ticket | null = null;
  searchPurchaseId = '';

  showOptions = false;
  unlinkedLogs: { number: string; user: string; purchaseId: string }[] = [];
  showConfirmModal = false;
  unlinkReason = '';

  buyerName = '';
  ticketsPurchased: number | null = null;
  buyerEmail = '';
  allAssociatedNumbers = '';
  buyerPhone = '';
  purchaseDate = '';

  winnerTicketNumber: string | null = null;
  winnerBuyer: BuyerInfo | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['raffle']) {
      this.initializeTickets();
    }
  }

  toggleOptions() {
    this.showOptions = !this.showOptions;
  }

  establecerComoGanador() {
    if (!this.selectedTicket || !this.selectedTicket.buyer) return;
    this.winnerTicketNumber = this.selectedTicket.number;
    this.winnerBuyer = this.selectedTicket.buyer;

    this.tickets.forEach((b) => {
      if (b.status === 'winner') {
        b.status = 'selected';
      }
    });
    this.selectedTicket.status = 'winner';

    this.showOptions = false;
  }

  initializeTickets() {
    this.selectedTicket = null;
    this.searchPurchaseId = '';
    this.clearForm();
    this.unlinkedLogs = [];
    this.showConfirmModal = false;
    this.unlinkReason = '';
    this.winnerTicketNumber = this.raffle?.winner || null;
    this.winnerBuyer = null;

    const raffle = this.raffle;
    if (!raffle) {
      this.tickets = [];
      return;
    }

    if (raffle.tickets && Array.isArray(raffle.tickets)) {
      this.tickets = JSON.parse(JSON.stringify(raffle.tickets));
      return;
    }

    const count = raffle.totalTickets || 100;

    const mockBuyer: BuyerInfo = {
      id: 'COMPRA-123',
      name: raffle.winnerName || 'Paco Briones Macias',
      email: raffle.winnerEmail || 'example@gmail.com',
      phone: raffle.winnerPhone || '0998452318',
      purchaseDate: '12/05/2026',
      tickets: ['05', '07', '14'],
    };

    this.tickets = Array.from({ length: count }, (_, i) => {
      const numStr = (i + 1).toString().padStart(2, '0');
      let status: 'available' | 'selected' | 'winner' = 'available';
      let buyer: BuyerInfo | undefined;

      if (mockBuyer.tickets.includes(numStr)) {
        status = numStr === raffle.winner ? 'winner' : 'selected';
        buyer = mockBuyer;
      } else if (numStr === raffle.winner && raffle.winner) {
        status = 'winner';
        buyer = {
          id: 'COMPRA-123',
          name: raffle.winnerName || 'Ganador Oficial',
          email: raffle.winnerEmail || 'ganador@gmail.com',
          phone: raffle.winnerPhone || '0999999999',
          purchaseDate: '14/05/2026',
          tickets: [numStr],
        };
      }

      return { number: numStr, status, buyer };
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
    this.buyerName = buyer.name;
    this.ticketsPurchased = buyer.tickets.length;
    this.buyerEmail = buyer.email;
    this.allAssociatedNumbers = buyer.tickets.map((num) => `[${num}]`).join(' ');
    this.buyerPhone = buyer.phone;
    this.purchaseDate = buyer.purchaseDate;
  }

  clearForm() {
    this.buyerName = '';
    this.ticketsPurchased = null;
    this.buyerEmail = '';
    this.allAssociatedNumbers = '';
    this.buyerPhone = '';
    this.purchaseDate = '';
    this.showOptions = false;
  }

  buscarCompra() {
    const query = this.searchPurchaseId.toUpperCase().trim();
    if (!query) {
      this.selectedTicket = null;
      this.clearForm();
      return;
    }

    const found = this.tickets.find((b) => {
      if (!b.buyer) return false;
      const id = (b.buyer.id || '').toUpperCase();
      const name = (b.buyer.name || '').toUpperCase();
      const email = (b.buyer.email || '').toUpperCase();
      const phone = b.buyer.phone || '';
      return (
        id.includes(query) ||
        name.includes(query) ||
        email.includes(query) ||
        phone.includes(query)
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
    const numToUnlink = this.selectedTicket.number;

    this.unlinkedLogs.push({
      number: numToUnlink,
      user: buyer.name,
      purchaseId: buyer.id,
    });

    buyer.tickets = buyer.tickets.filter((num) => num !== numToUnlink);

    this.selectedTicket.status = 'available';
    delete this.selectedTicket.buyer;
    if (buyer.tickets.length > 0) {
      this.tickets.forEach((b) => {
        if (b.buyer && b.buyer.id === buyer.id) {
          b.buyer = buyer;
          if (b.number === numToUnlink) {
            b.status = 'available';
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
    const buyerName = this.selectedTicket.buyer.name;
    this.tickets.forEach((b) => {
      if (b.buyer && b.buyer.id === buyerId) {
        this.unlinkedLogs.push({
          number: b.number,
          user: buyerName,
          purchaseId: buyerId,
        });
        b.status = 'available';
        delete b.buyer;
      }
    });

    this.clearForm();
    this.selectedTicket = null;
    this.showOptions = false;
  }

  get hasWinnerChanged(): boolean {
    return this.winnerTicketNumber !== (this.raffle?.winner || null);
  }

  onSaveClick() {
    if (this.hasWinnerChanged || this.unlinkedLogs.length > 0) {
      this.showConfirmModal = true;
    } else {
      this.confirmSubmit();
    }
  }

  cancelConfirm() {
    this.showConfirmModal = false;
  }

  confirmSubmit() {
    this.showConfirmModal = false;
    this.onSubmit();
    document.getElementById('btn-cerrar-modal-editar-boletos')?.click();
  }

  onSubmit() {
    const raffle = this.raffle;
    if (!raffle) return;

    const soldCount = this.tickets.filter((b) => b.status !== 'available').length;
    const newRecaudado = soldCount * (raffle.ticketPrice || DEFAULT_RAFFLE_TICKET_PRICE);

    const existingLogs = raffle.unlinks || [];
    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newLogs = this.unlinkedLogs.map((log) => ({
      number: log.number,
      user: log.user,
      purchaseId: log.purchaseId,
      reason: this.unlinkReason.trim(),
      date: formattedDate,
    }));

    const updatedRaffle: Raffle = {
      ...raffle,
      tickets: this.tickets,
      soldTickets: soldCount,
      collected: newRecaudado,
      soldTicketsStr: `${soldCount}/${raffle.totalTickets || DEFAULT_RAFFLE_TICKETS_TOTAL}`,
      collectedStr: raffle.goal ? `${newRecaudado}/${raffle.goal} $` : `${newRecaudado}$`,
      unlinks: [...existingLogs, ...newLogs],
    };

    if (this.winnerTicketNumber) {
      updatedRaffle.winner = this.winnerTicketNumber;
      if (this.winnerBuyer) {
        updatedRaffle.winnerName = this.winnerBuyer.name;
        updatedRaffle.winnerEmail = this.winnerBuyer.email;
        updatedRaffle.winnerPhone = this.winnerBuyer.phone;
      }
      updatedRaffle.status = 'FINALIZADA';
    }

    this.save.emit(updatedRaffle);
  }
}
