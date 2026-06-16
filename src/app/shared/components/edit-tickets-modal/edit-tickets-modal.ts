import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of, Observable, switchMap, concat, toArray } from 'rxjs';
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
  private readonly cdr = inject(ChangeDetectorRef);
  userRole = this.authService.getUserRole();

  tickets: Ticket[] = [];
  selectedTicket: Ticket | null = null;
  searchPurchaseId = '';

  currentPage = 1;
  pageSize = 100;
  totalItems = 0;

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.tickets.length / this.pageSize));
  }

  get paginatedTickets(): Ticket[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.tickets.slice(startIndex, endIndex);
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
    this.clearForm();
    this.unlinkedLogs = [];
    this.showConfirmModal = false;
    this.unlinkReason = '';
    this.winnerTicketNumber = this.raffle?.winner || null;
    this.winnerBuyer = null;

    this.currentPage = 1;

    const raffle = this.raffle;
    if (!raffle || !raffle._id) {
      this.tickets = [];
      this.totalItems = 0;
      return;
    }

    // Traemos todos (hasta 5000 o el límite por defecto del backend)
    const fetchLimit = 5000;
    const tickets$ = this.mode === 'sorteos'
      ? this.drawService.getTicketsByRaffle(raffle._id, 1, fetchLimit)
      : this.ticketService.getTicketsByRaffle(raffle._id, 1, fetchLimit);

    tickets$.subscribe({
      next: (res) => {
        if (res && res.data) {
          this.tickets = res.data;
          this.totalItems = res.totalCount || res.data.length;
        } else {
          this.tickets = [];
          this.totalItems = 0;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('API Error: No se pudieron cargar los boletos del backend.', err);
        this.tickets = [];
        this.totalItems = 0;
        this.cdr.detectChanges();
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

  formatPurchaseDate(dateVal: any): string {
    if (!dateVal) return '';
    try {
      const date = new Date(dateVal);
      if (isNaN(date.getTime())) return String(dateVal);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch {
      return String(dateVal);
    }
  }

  loadBuyer(buyer: BuyerInfo) {
    this.buyerName = buyer.name || '';
    this.buyerEmail = buyer.email || '';
    this.buyerPhone = buyer.phone || '';
    
    const rawDate = this.selectedTicket?.buyer?.purchaseDate || buyer.purchaseDate;
    this.purchaseDate = this.formatPurchaseDate(rawDate);

    if (buyer.userId) {
      const userTickets = this.tickets
        .filter((t) => t.buyer && t.buyer.userId === buyer.userId)
        .map((t) => t.number);

      this.ticketsPurchased = userTickets.length;
      this.allAssociatedNumbers = userTickets
        .map((num) => parseInt(num, 10))
        .sort((a, b) => a - b)
        .map((num) => `[${num}]`)
        .join(' ');
    } else {
      this.ticketsPurchased = buyer.tickets.length;
      this.allAssociatedNumbers = buyer.tickets.map((num) => `[${num}]`).join(' ');
    }
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
      this.selectTicket(found);
    } else {
      // NOTE: En paginación real de servidor, si no lo encuentra en la pag actual,
      // habría que hacer un request al backend para buscarlo. Por ahora advertimos
      console.warn("Boleto no encontrado en esta página. La búsqueda global requiere un endpoint específico.");
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

    const buyer = this.selectedTicket.buyer;
    const buyerName = buyer.name;
    this.tickets.forEach((b) => {
      const match = b.buyer && (buyer.userId && b.buyer.userId 
        ? b.buyer.userId === buyer.userId 
        : b.buyer.id === buyer.id);

      if (match) {
        this.unlinkedLogs.push({
          number: b.number,
          user: buyerName,
          purchaseId: b.buyer!.id,
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
    const unlink$: Observable<any> = this.unlinkedLogs.length > 0
      ? this.ticketService.unlinkBulk(
          raffle._id,
          this.unlinkedLogs.map((log) => log.number),
          this.unlinkReason.trim()
        )
      : of(null);

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
