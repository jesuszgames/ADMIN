import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { RaffleService } from '../../../../core/services/api/raffle.service';
import { Subscription } from 'rxjs';
import { TicketService, BackendUnlinkLog } from '../../../../core/services/api/ticket.service';
import { Filter } from '../../../../shared/components/filter/filter';
import { Tables } from '../../../../shared/components/tables/tables';
import { DeleteModal } from '../../../../shared/components/delete-modal/delete-modal';
import { HistoryRafflesModal } from '../../../../shared/components/history-raffles-modal/history-raffles-modal';
import { HistoryTicketModel } from '../../../../shared/components/history-ticket-model/history-ticket-model';
import { RaffleDetail } from '../../../../core/interfaces/api/raffle-detail.interface';
import { TicketHistoryData } from '../../../../core/interfaces/api/ticket-history-data.interface';
import { mapRaffleDetails, mapTicketDetails } from '../../../../core/helpers/ui/utils';
import {
  HISTORY_COLUMNS,
  HISTORY_FILTERS,
  HISTORY_ROW_ACTIONS,
  HISTORY_PRINCIPAL_HEADER,
  HISTORY_FILTER_ALL,
  HISTORY_FILTER_TICKETS,
  HISTORY_FILTER_GOAL,
  HISTORY_FILTER_DELETE,
  HISTORY_FILTER_VALUES,
  HISTORY_STATUS_VALUES,
  METHOD_AUTOMATIC,
} from '../../../../core/helpers/global/history.constants';
import { HistoryRaffle } from '../../../../core/interfaces/api/history-raffle.interface';
import { UnlinkLogs } from '../../../../shared/components/unlink-logs/unlink-logs';
import { Raffle } from '../../../../core/interfaces/api/raffle.interface';
import {
  TABLE_ACTION_VIEW_DETAIL,
  TABLE_ACTION_VIEW_TICKETS,
  TABLE_ACTION_DASHBOARD_DELETE,
  TABLE_ACTION_VIEW_UNLINK_LOGS,
} from '../../../../core/helpers/ui/constants';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule,
    Filter,
    Tables,
    DeleteModal,
    HistoryRafflesModal,
    HistoryTicketModel,
    UnlinkLogs,
  ],
  templateUrl: './history.html',
  styleUrl: './history.scss',
})
export class History implements OnInit, OnDestroy {
  private readonly raffleService = inject(RaffleService);
  private activeSub?: Subscription;
  private readonly ticketService = inject(TicketService);
  private readonly cdr = inject(ChangeDetectorRef);

  principalHeader = HISTORY_PRINCIPAL_HEADER;
  historyColumns = HISTORY_COLUMNS;
  historyFilters = HISTORY_FILTERS;
  historyActions = HISTORY_ROW_ACTIONS;

  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  searchText = '';
  filtroActual = HISTORY_FILTER_ALL;
  rifaSeleccionadaParaBorrar: HistoryRaffle | null = null;
  selectedRaffle: RaffleDetail | null = null;
  selectedTicketData: TicketHistoryData | null = null;
  selectedRaffleForLogs: Raffle | null = null;

  private readonly BTN_HISTORY_MODAL_ID = 'btn-abrir-modal-history';
  private readonly BTN_TICKETS_MODAL_ID = 'btn-abrir-modal-tickets';
  private readonly BTN_DELETE_HISTORY_ID = 'btn-abrir-modal-delete-history';

  tableData: HistoryRaffle[] = [];
  loading = false;

  ngOnInit(): void {
    setTimeout(() => {
      this.cargarRifas();
    });
  }

  cargarRifas(): void {
    if (this.activeSub) {
      this.activeSub.unsubscribe();
    }
    this.loading = true;
    this.cdr.detectChanges();

    let statuses = [
      HISTORY_STATUS_VALUES.FINISHED,
      HISTORY_STATUS_VALUES.DELETED,
    ].join(',');

    let backendFilter = '';
    if (this.filtroActual === HISTORY_FILTER_TICKETS) {
      statuses = HISTORY_STATUS_VALUES.FINISHED;
      backendFilter = HISTORY_FILTER_VALUES.TICKETS;
    } else if (this.filtroActual === HISTORY_FILTER_GOAL) {
      statuses = HISTORY_STATUS_VALUES.FINISHED;
      backendFilter = HISTORY_FILTER_VALUES.GOAL;
    } else if (this.filtroActual === HISTORY_FILTER_DELETE) {
      statuses = HISTORY_STATUS_VALUES.DELETED;
    }

    this.activeSub = this.raffleService
      .getAll(this.currentPage, this.pageSize, this.searchText, statuses, undefined, backendFilter, '{"endDate":-1}')
      .subscribe({
        next: (res) => {
          if (res && res.data) {
            this.totalItems = res.totalCount || 0;
            this.tableData = res.data.map((r: Raffle) => ({
              ...r,
              goal: r.goal || 0,
              drawMethod: r.drawMethod || (METHOD_AUTOMATIC as 'AUTOMATIC' | 'MANUAL'),
              soldTicketsStr: `${r.soldTickets}/${r.totalTickets}`,
              collectedStr: `${r.collected}/${r.goal || 0} $`,
            }));
          }
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('API Error: No se pudieron cargar las rifas para el historial.', err);
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  ngOnDestroy(): void {
    if (this.activeSub) {
      this.activeSub.unsubscribe();
    }
  }

  filtrarPorCategoria(id: string): void {
    this.filtroActual = id;
    this.currentPage = 1;
    this.cargarRifas();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.cargarRifas();
  }

  onSearchChange(search: string): void {
    this.searchText = search;
    this.currentPage = 1;
    this.cargarRifas();
  }

  manejarAccion(evento: { actionId: number; row: HistoryRaffle }): void {
    try {
      const actions: Record<number, () => void> = {
        [TABLE_ACTION_VIEW_DETAIL]: () => {
          this.onViewDetails(evento.row);
          document.getElementById(this.BTN_HISTORY_MODAL_ID)?.click();
        },
        [TABLE_ACTION_VIEW_TICKETS]: () => {
          this.onViewTicketDetails(evento.row);
          document.getElementById(this.BTN_TICKETS_MODAL_ID)?.click();
        },
        [TABLE_ACTION_DASHBOARD_DELETE]: () => {
          this.rifaSeleccionadaParaBorrar = evento.row;
          document.getElementById(this.BTN_DELETE_HISTORY_ID)?.click();
        },
        [TABLE_ACTION_VIEW_UNLINK_LOGS]: () => {
          this.selectedRaffleForLogs = { ...(evento.row as unknown as Raffle), unlinks: [] };
          this.ticketService.getUnlinkedLogs(evento.row._id, 1, 1000).subscribe({
            next: (res) => {
              const logs = res?.data && !Array.isArray(res.data) && res.data.result ? res.data.result : (Array.isArray(res?.data) ? res.data : []);
              if (this.selectedRaffleForLogs) {
                this.selectedRaffleForLogs.unlinks = logs.map((log: BackendUnlinkLog) => {
                  const userVal = log.userId
                    ? (typeof log.userId === 'object' ? log.userId.name || log.userId.username : log.userId)
                    : 'User';
                  return {
                    number: log.number,
                    user: typeof userVal === 'object'
                      ? (userVal as { name?: string; username?: string }).name || (userVal as { name?: string; username?: string }).username || 'User'
                      : String(userVal),
                    purchaseId: log.purchaseId,
                    reason: log.reason,
                    date: log.date
                  };
                });
                this.cdr.detectChanges();
              }
            },
            error: (err) => {
              console.error('API Error: No se pudieron cargar logs de desvinculados', err);
            }
          });
          document.getElementById('btn-abrir-modal-unlink-logs')?.click();
        },
      };

      const action = actions[evento.actionId];
      if (!action) throw new Error();
      action();
    } catch {}
  }

  confirmarEliminar(razon: string): void {
    const targetRaffle = this.rifaSeleccionadaParaBorrar;
    if (!targetRaffle) return;

    this.raffleService.deleteRaffle(targetRaffle._id, razon).subscribe({
      next: () => {
        this.cargarRifas();
      },
      error: (err) => {
        console.error('API Error: No se pudo eliminar la rifa.', err);
      },
    });
    this.rifaSeleccionadaParaBorrar = null;
  }

  onViewTicketDetails(raffle: HistoryRaffle): void {
    this.selectedTicketData = null;
    this.ticketService.getTicketsByRaffle(raffle._id).subscribe({
      next: (res) => {
        if (res && res.data) {
          this.selectedTicketData = mapTicketDetails(res.data, raffle);
        }
      },
      error: (err) => {
        console.error('API Error: No se pudieron cargar los boletos del backend.', err);
      },
    });
  }

  onViewDetails(raffle: HistoryRaffle): void {
    this.selectedRaffle = mapRaffleDetails(raffle);
  }
}
