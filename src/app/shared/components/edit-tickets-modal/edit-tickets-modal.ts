import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  inject,
  ChangeDetectorRef,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
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
  @Output() closed = new EventEmitter<void>();

  closeModal() {
    this.selectedTicket = null;
    this.searchPurchaseId = '';
    this.clearForm();
    this.unlinkedLogs = [];
    this.showConfirmModal = false;
    this.unlinkReason = '';
    this.winnerTicketNumber = null;
    this.winnerBuyer = null;
    this.closed.emit();
  }

  private readonly authService = inject(AuthService);
  private readonly ticketService = inject(TicketService);
  private readonly drawService = inject(DrawService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  userRole = this.authService.getUserRole();

  tickets: Ticket[] = [];
  selectedTicket: Ticket | null = null;
  searchPurchaseId = '';
  isLoadingTickets = false;
  showSkeleton = false;

  currentPage = 1;
  pageSize = 100;
  totalItems = 0;

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  get paginatedTickets(): Ticket[] {
    return this.tickets;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.fetchTickets();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetchTickets();
    }
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.fetchTickets();
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
    this.unlinkedLogs = [];
    this.showConfirmModal = true;
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
    this.tickets = [];
    this.totalItems = 0;
    this.showSkeleton = true;
    this.fetchTickets();
  }

  fetchTickets() {
    const raffle = this.raffle;
    if (!raffle || !raffle._id) {
      this.tickets = [];
      this.totalItems = 0;
      this.isLoadingTickets = false;
      this.showSkeleton = false;
      return;
    }

    this.isLoadingTickets = true;
    this.cdr.detectChanges();

    const tickets$ = this.mode === 'sorteos'
      ? this.drawService.getTicketsByRaffle(raffle._id, this.currentPage, this.pageSize)
      : this.ticketService.getTicketsByRaffle(raffle._id, this.currentPage, this.pageSize);

    tickets$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (res) => {
        if (res && res.data) {
          this.tickets = res.data;
          this.totalItems = res.totalCount || res.data.length;
        } else {
          this.tickets = [];
          this.totalItems = 0;
        }
        this.isLoadingTickets = false;
        this.showSkeleton = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('API Error: No se pudieron cargar los boletos del backend.', err);
        this.tickets = [];
        this.totalItems = 0;
        this.isLoadingTickets = false;
        this.showSkeleton = false;
        this.cdr.detectChanges();
      },
    });
  }

  selectTicket(ticket: Ticket) {
    this.selectedTicket = ticket;
    if (ticket.buyer) {
      this.loadBuyer(ticket.buyer);
      if (ticket.buyer.userId && this.raffle?._id) {
        this.ticketService.getUserTicketsInRaffle(this.raffle._id, ticket.buyer.userId)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
          next: (res) => {
            if (res && res.data && this.selectedTicket && this.selectedTicket.buyer && this.selectedTicket.buyer.userId === ticket.buyer!.userId) {
              this.selectedTicket.buyer.tickets = res.data;
              this.loadBuyer(this.selectedTicket.buyer);
            }
          },
          error: (err) => {
            console.error('Error fetching complete user tickets:', err);
          }
        });
      }
    } else {
      this.clearForm();
    }
  }

  formatPurchaseDate(dateVal: Date | string | number | null | undefined): string {
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

    const ticketSet = new Set<string>();

    if (buyer.tickets && Array.isArray(buyer.tickets)) {
      buyer.tickets.forEach((num) => ticketSet.add(num));
    }

    if (buyer.userId) {
      this.tickets
        .filter((t) => t.buyer && t.buyer.userId === buyer.userId)
        .forEach((t) => ticketSet.add(t.number));
    }

    const uniqueTickets = Array.from(ticketSet);

    this.ticketsPurchased = uniqueTickets.length;
    this.allAssociatedNumbers = uniqueTickets
      .map((num) => parseInt(num, 10))
      .sort((a, b) => a - b)
      .map((num) => `[${num}]`)
      .join(' ');
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
      console.warn("Boleto no encontrado en esta página.");
      this.selectedTicket = null;
      this.clearForm();
    }
  }

  desvincularSeleccionado() {
    this.openUnlinkConfirm('single');
  }

  desvincularTodos() {
    this.openUnlinkConfirm('all');
  }

  /**
   * Builds the list of tickets that will be unlinked and opens the
   * confirmation modal.
   *
   * @param scope 'single' unlinks only the currently selected ticket;
   *              'all' unlinks every ticket belonging to the same buyer.
   */
  private openUnlinkConfirm(scope: 'single' | 'all'): void {
    const selected = this.selectedTicket;
    if (!selected || !selected.buyer) return;
    const buyer = selected.buyer;
    const buyerName = buyer.name;
    const buyerPurchaseId = buyer.id;

    if (scope === 'single') {
      this.unlinkedLogs = [
        {
          number: selected.number,
          user: buyerName,
          purchaseId: buyerPurchaseId,
        },
      ];
    } else {
      const ticketNumbers = this.collectBuyerTicketNumbers(buyer);
      this.unlinkedLogs = ticketNumbers.map((ticketNumber) => {
        const ticketDoc = this.tickets.find((t) => t.number === ticketNumber);
        return {
          number: ticketNumber,
          user: buyerName,
          purchaseId: ticketDoc?.buyer?.id || buyerPurchaseId,
        };
      });
    }

    this.winnerTicketNumber = null;
    this.winnerBuyer = null;
    this.showConfirmModal = true;
    this.showOptions = false;
  }

  /**
   * Returns every ticket number associated with the given buyer, deduplicated.
   * Order of precedence:
   *   1) buyer.tickets (already aggregated by the backend)
   *   2) same buyer.userId inside the currently loaded page
   *   3) same buyer.id (purchase id) inside the currently loaded page
   */
  private collectBuyerTicketNumbers(buyer: BuyerInfo): string[] {
    const ticketSet = new Set<string>();

    if (buyer.tickets && Array.isArray(buyer.tickets)) {
      buyer.tickets.forEach((num) => ticketSet.add(num));
    }
    if (buyer.userId) {
      this.tickets
        .filter((t) => t.buyer && t.buyer.userId === buyer.userId)
        .forEach((t) => ticketSet.add(t.number));
    }
    if (buyer.id) {
      this.tickets
        .filter((t) => t.buyer && t.buyer.id === buyer.id)
        .forEach((t) => ticketSet.add(t.number));
    }

    return Array.from(ticketSet);
  }

  get isUnlinkReasonValid(): boolean {
    if (this.unlinkedLogs.length === 0) return true;
    const trimmed = (this.unlinkReason || '').trim();
    return trimmed.length >= 5 && trimmed.length <= 500;
  }

  get hasWinnerChanged(): boolean {
    return this.winnerTicketNumber !== null && this.winnerTicketNumber !== (this.raffle?.winner || null);
  }

  cancelConfirm() {
    this.showConfirmModal = false;
    this.unlinkedLogs = [];
    this.winnerTicketNumber = this.raffle?.winner || null;
    this.winnerBuyer = null;
  }

  confirmSubmit() {
    if (this.isSaving) return;
    const raffle = this.raffle;
    if (!raffle || !raffle._id) return;

    this.isSaving = true;
    this.cdr.detectChanges();

    const isDraw = this.unlinkedLogs.length === 0;

    const action$: Observable<unknown> = this.unlinkedLogs.length > 0
      ? this.ticketService.unlinkBulk(
          raffle._id,
          this.unlinkedLogs.map((log) => log.number),
          this.unlinkReason.trim()
        )
      : this.drawService.executeDraw(raffle._id, this.winnerTicketNumber!);

    action$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: () => {
        this.isSaving = false;
        this.showConfirmModal = false;
        this.unlinkedLogs = [];
        this.unlinkReason = '';
        this.selectedTicket = null;
        this.clearForm();
        this.fetchTickets();
        this.save.emit(raffle);
        if (isDraw) {
          document.getElementById('btn-cerrar-modal-editar-boletos')?.click();
        }
      },
      error: (err: unknown) => {
        console.error('Error al ejecutar acción inmediata:', err);
        this.isSaving = false;
        this.showConfirmModal = false;
        this.cdr.detectChanges();
      },
    });
  }
}
