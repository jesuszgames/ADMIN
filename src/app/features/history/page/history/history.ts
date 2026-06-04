import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RaffleService } from '../../../../core/services/api/raffle.service';
import { TicketService } from '../../../../core/services/api/ticket.service';
import { Filter } from '../../../../shared/components/filter/filter';
import { Tables } from '../../../../shared/components/tables/tables';
import { DeleteModal } from '../../../../shared/components/delete-modal/delete-modal';
import { HistoryRafflesModal } from '../../../../shared/components/history-raffles-modal/history-raffles-modal';
import { HistoryTicketModel } from '../../../../shared/components/history-ticket-model/history-ticket-model';
import { Ticket } from '../../../../core/interfaces/api/ticket.interface';
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
  MY_HISTORY_DATA_MOCK,
  STATE_DELETED,
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
  imports: [CommonModule, Filter, Tables, DeleteModal, HistoryRafflesModal, HistoryTicketModel, UnlinkLogs],
  templateUrl: './history.html',
  styleUrl: './history.scss',
})
export class History implements OnInit {
  private readonly raffleService = inject(RaffleService);
  private readonly ticketService = inject(TicketService);

  principalHeader = HISTORY_PRINCIPAL_HEADER;
  historyColumns = HISTORY_COLUMNS;
  historyFilters = HISTORY_FILTERS;
  historyActions = HISTORY_ROW_ACTIONS;

  filtroActual = HISTORY_FILTER_ALL;
  rifaSeleccionadaParaBorrar: HistoryRaffle | null = null;
  selectedRaffle: RaffleDetail | null = null;
  selectedTicketData: TicketHistoryData | null = null;
  selectedRaffleForLogs: Raffle | null = null;

  private readonly BTN_HISTORY_MODAL_ID = 'btn-abrir-modal-history';
  private readonly BTN_TICKETS_MODAL_ID = 'btn-abrir-modal-tickets';
  private readonly BTN_DELETE_HISTORY_ID = 'btn-abrir-modal-delete-history';

  historyData: HistoryRaffle[] = [];
  tableData: HistoryRaffle[] = [];

  ngOnInit(): void {
    this.cargarRifas();
  }

  cargarRifas(): void {
    this.raffleService.getAll().subscribe({
      next: (res) => {
        if (res && res.data) {
          this.historyData = res.data.map((r: any) => ({
            ...r,
            goal: r.goal || 0
          }));
          this.tableData = this.getFilteredData(this.filtroActual);
        }
      },
      error: (err) => {
        console.error('API Error: No se pudieron cargar las rifas para el historial.', err);
      }
    });
  }

  filtrarPorCategoria(id: string): void {
    this.filtroActual = id;
    this.tableData = this.getFilteredData(id);
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
          this.selectedRaffleForLogs = evento.row as unknown as Raffle;
          document.getElementById('btn-abrir-modal-unlink-logs')?.click();
        },
      };

      const action = actions[evento.actionId];
      if (!action) throw new Error();
      action();
    } catch { }
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

  private getFilteredData(filterId: string): HistoryRaffle[] {
    const historyRaffles = this.historyData.filter((r) => {
      const statusUpper = (r.status || '').toUpperCase();
      return (
        statusUpper === 'FINISHED' ||
        statusUpper === 'FINALIZADA' ||
        statusUpper === 'FINALIZADO' ||
        statusUpper === 'PENDING_DRAW' ||
        statusUpper === 'DELETED' ||
        statusUpper === 'ELIMINADO' ||
        statusUpper === 'ELIMINADA'
      );
    });

    const isDeleted = (status: string) => {
      const s = (status || '').toUpperCase();
      return s === 'DELETED' || s === 'ELIMINADO' || s === 'ELIMINADA';
    };

    let filtered = historyRaffles;
    try {
      const filterActions: Record<string, () => HistoryRaffle[]> = {
        [HISTORY_FILTER_ALL]: () => historyRaffles,
        [HISTORY_FILTER_TICKETS]: () =>
          historyRaffles.filter((r) => !isDeleted(r.status) && r.soldTickets === r.totalTickets),
        [HISTORY_FILTER_GOAL]: () =>
          historyRaffles.filter((r) => !isDeleted(r.status) && r.collected === r.goal),
        [HISTORY_FILTER_DELETE]: () =>
          historyRaffles.filter((r) => isDeleted(r.status)),
      };

      const filterFn = filterActions[filterId];
      if (filterFn) {
        filtered = filterFn();
      }
    } catch { }

    return filtered.map((raffle) => ({
      ...raffle,
      drawMethod: raffle.drawMethod || (METHOD_AUTOMATIC as 'AUTOMATIC' | 'MANUAL'),
      soldTicketsStr: `${raffle.soldTickets}/${raffle.totalTickets}`,
      collectedStr: `${raffle.collected}/${raffle.goal} $`,
    }));
  }
}
