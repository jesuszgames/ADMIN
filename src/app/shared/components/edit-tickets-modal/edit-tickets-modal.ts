import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of, Observable, switchMap } from 'rxjs';
import { AuthService } from '../../../core/services/api/auth.service';
import { Raffle } from '../../../core/interfaces/api/raffle.interface';
import { Ticket, BuyerInfo } from '../../../core/interfaces/api/ticket.interface';
import { TicketService } from '../../../core/services/api/ticket.service';
import { DrawService } from '../../../core/services/api/draw.service';

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
  @Input() isSaving = false;
  @Output() save = new EventEmitter<Raffle>();

  private readonly authService = inject(AuthService);
  private readonly ticketService = inject(TicketService);
  private readonly drawService = inject(DrawService);
  userRole = this.authService.getUserRole();

  tickets: Ticket[] = [];
  selectedTicket: Ticket | null = null;
  searchPurchaseId = '';

  currentPage = 1;
  pageSize = 100;

  get totalPages(): number {
    return Math.ceil(this.tickets.length / this.pageSize);
  }

  get paginatedTickets(): Ticket[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.tickets.slice(startIndex, startIndex + this.pageSize);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

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
    this.currentPage = 1;
    this.clearForm();
    this.unlinkedLogs = [];
    this.showConfirmModal = false;
    this.unlinkReason = '';
    this.winnerTicketNumber = this.raffle?.winner || null;
    this.winnerBuyer = null;

    const raffle = this.raffle;
    if (!raffle || !raffle._id) {
      this.tickets = [];
      return;
    }

    this.ticketService.getTicketsByRaffle(raffle._id).subscribe({
      next: (res) => {
        if (res && res.data) {
          this.tickets = res.data;
        } else {
          this.tickets = [];
        }
      },
      error: (err) => {
        console.error('API Error: No se pudieron cargar los boletos del backend.', err);
        this.tickets = [];
      },
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
    this.buyerName = buyer.name || '';
    this.ticketsPurchased = buyer.tickets.length;
    this.buyerEmail = buyer.email || '';
    this.allAssociatedNumbers = buyer.tickets.map((num) => `[${num}]`).join(' ');
    this.buyerPhone = buyer.phone || '';
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
      const name = (b.buyer.name || '').toUpperCase();
      const id = (b.buyer.id || '').toUpperCase();
      return name.includes(query) || id.includes(query);
    });

    if (found) {
      const index = this.tickets.indexOf(found);
      if (index !== -1) {
        this.currentPage = Math.floor(index / this.pageSize) + 1;
      }
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

  get isUnlinkReasonValid(): boolean {
    if (this.unlinkedLogs.length === 0) return true;
    const trimmed = (this.unlinkReason || '').trim();
    return trimmed.length >= 5 && trimmed.length <= 500;
  }

  get hasWinnerChanged(): boolean {
    return this.winnerTicketNumber !== (this.raffle?.winner || null);
  }

  onSaveClick() {
    if (this.isSaving) return;
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
    if (this.isSaving) return;
    this.showConfirmModal = false;
    const raffle = this.raffle;
    if (!raffle || !raffle._id) return;

    this.isSaving = true;
    const unlinkCalls = this.unlinkedLogs.map((log) =>
      this.ticketService.unlinkTicket(raffle._id, log.number, this.unlinkReason.trim()),
    );

    const unlink$: Observable<any> = unlinkCalls.length > 0 ? forkJoin(unlinkCalls) : of(null);

    unlink$
      .pipe(
        switchMap(() => {
          if (this.hasWinnerChanged && this.winnerTicketNumber) {
            return this.drawService.executeDraw(raffle._id, this.winnerTicketNumber);
          }
          return of(null);
        }),
      )
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.save.emit(raffle);
          document.getElementById('btn-cerrar-modal-editar-boletos')?.click();
        },
        error: (err: any) => {
          console.error('Error al guardar cambios de boletos/sorteo:', err);
          this.isSaving = false;
          this.save.emit(raffle);
          document.getElementById('btn-cerrar-modal-editar-boletos')?.click();
        },
      });
  }
}
