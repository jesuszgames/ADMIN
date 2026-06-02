import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Filter } from '../../../../shared/components/filter/filter';
import { Tables } from '../../../../shared/components/tables/tables';
import { DeleteModal } from '../../../../shared/components/delete-modal/delete-modal';
import { HistoryRafflesModal } from '../../../../shared/components/history-raffles-modal/history-raffles-modal';
import { HistoryTicketModel } from '../../../../shared/components/history-ticket-model/history-ticket-model';
import { Ticket } from '../../../../core/interfaces/api/ticket.interface';
import { RaffleDetail } from '../../../../core/interfaces/api/raffle-detail.interface';
import { TicketHistoryData } from '../../../../core/interfaces/api/ticket-history-data.interface';
import {
  DEFAULT_MONEY_GOAL,
  BENEFICIARY_PERCENTAGE,
  WINNER_PERCENTAGE,
  TICKETS_TOTAL_COUNT,
  DEFAULT_RAFFLE_PHOTO,
} from '../../../../core/helpers/global/dashboard.constants';
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
export class History {
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

  filtrarPorCategoria(id: string): void {
    this.filtroActual = id;
    this.tableData = this.getFilteredData(id);
  }

  historyData: HistoryRaffle[] = [...MY_HISTORY_DATA_MOCK];
  tableData: HistoryRaffle[] = [];

  constructor() {
    this.tableData = this.getFilteredData(this.filtroActual);
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
    } catch {}
  }

  confirmarEliminar(razon: string): void {
    try {
      const targetRaffle = this.rifaSeleccionadaParaBorrar;
      if (!targetRaffle) throw new Error();
      const index = this.historyData.findIndex((r) => r._id === targetRaffle._id);
      if (index === -1) throw new Error();
      this.historyData[index].status = STATE_DELETED;
      this.historyData[index].deleteReason = razon;
      this.tableData = this.getFilteredData(this.filtroActual);
      this.rifaSeleccionadaParaBorrar = null;
    } catch {}
  }

  onViewTicketDetails(raffle: HistoryRaffle): void {
    const ticketsTotalCount = raffle.totalTickets || TICKETS_TOTAL_COUNT;
    const generatedTickets: Ticket[] = Array.from({ length: ticketsTotalCount }, (_, i) => {
      const numStr = (i + 1).toString().padStart(2, '0');
      let status: 'available' | 'selected' | 'winner' = 'available';

      if (numStr === (raffle.winner || '07')) {
        status = 'winner';
      } else if (raffle.associatedNumbers && raffle.associatedNumbers.includes(`[${numStr}]`)) {
        status = 'selected';
      } else if (!raffle.associatedNumbers && (numStr === '05' || numStr === '14')) {
        status = 'selected';
      }

      return { number: numStr, status };
    });

    const associatedNumbers = raffle.associatedNumbers || '[05] [07] [14]';
    const ticketsPurchased = raffle.associatedNumbers
      ? associatedNumbers.split(']').filter(Boolean).length
      : 3;

    this.selectedTicketData = {
      winnerName: raffle.winnerName || 'Paco Briones Macias',
      ticketsPurchased: ticketsPurchased,
      associatedNumbers: associatedNumbers,
      email: raffle.winnerEmail || 'example@gmail.com',
      winnerTicket: raffle.winner || '07',
      phone: raffle.winnerPhone || '0998452318',
      lastPurchaseDate: '12/05/2026',
      tickets: generatedTickets,
    };
  }

  onViewDetails(raffle: HistoryRaffle): void {
    const totalCollected = raffle.collected;
    const moneyGoal = raffle.goal || DEFAULT_MONEY_GOAL;
    const beneficiaryPercentage =
      raffle.beneficiaryPercentage !== undefined
        ? raffle.beneficiaryPercentage
        : BENEFICIARY_PERCENTAGE;
    const winnerPercentage =
      raffle.winnerPercentage !== undefined ? raffle.winnerPercentage : WINNER_PERCENTAGE;

    const beneficiaryAmount = (totalCollected * beneficiaryPercentage) / 100;
    const winnerAmount = (totalCollected * winnerPercentage) / 100;

    this.selectedRaffle = {
      name: raffle.title,
      foundation: raffle.foundation,
      startDate: raffle.startDate || '10/05/2026',
      endDate: raffle.endDate || '14/05/2026',
      category: raffle.category,
      ticketPrice: raffle.ticketPrice || 30,
      winningTicket: raffle.winner,
      moneyGoal: moneyGoal,
      ticketsSold: raffle.soldTickets,
      ticketsAvailable: raffle.totalTickets,
      totalCollected: totalCollected,
      photo: raffle.photo || DEFAULT_RAFFLE_PHOTO,
      beneficiaryAmount,
      beneficiaryPercentage: beneficiaryPercentage,
      winnerAmount,
      winnerPercentage: winnerPercentage,
      blogCardText: raffle.blogCardText || 'Ayuda a reforestar 10,000 hectáreas en el Amazonas.',
      blogDetailText:
        raffle.blogDetailText ||
        'Detalle completo de la rifa se muestra aquí...\nPuedes añadir toda la información detallada que necesites sobre los premios, mecánicas y condiciones de participación de la rifa en esta sección interactiva.',
      drawMethod: raffle.drawMethod,
      deleteReason: raffle.deleteReason || '',
      unlinks: raffle.unlinks || [],
    };
  }

  private getFilteredData(filterId: string): HistoryRaffle[] {
    let filtered = this.historyData;
    try {
      const filterActions: Record<string, () => HistoryRaffle[]> = {
        [HISTORY_FILTER_ALL]: () => this.historyData.filter((r) => r.status !== STATE_DELETED),
        [HISTORY_FILTER_TICKETS]: () => this.historyData.filter(
          (r) => r.status !== STATE_DELETED && r.soldTickets === r.totalTickets,
        ),
        [HISTORY_FILTER_GOAL]: () => this.historyData.filter(
          (r) => r.status !== STATE_DELETED && r.collected === r.goal,
        ),
        [HISTORY_FILTER_DELETE]: () => this.historyData.filter((r) => r.status === STATE_DELETED),
      };

      const filterFn = filterActions[filterId];
      if (!filterFn) throw new Error();
      filtered = filterFn();
    } catch {}

    return filtered.map((raffle) => ({
      ...raffle,
      drawMethod: raffle.drawMethod || (METHOD_AUTOMATIC as 'AUTOMATICO' | 'MANUAL'),
      soldTicketsStr: `${raffle.soldTickets}/${raffle.totalTickets}`,
      collectedStr: `${raffle.collected}/${raffle.goal} $`,
    }));
  }
}
