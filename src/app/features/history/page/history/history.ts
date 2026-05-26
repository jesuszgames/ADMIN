import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Filter } from '../../../../shared/components/filter/filter';
import { Tables } from '../../../../shared/components/tables/tables';
import { DeleteModal } from '../../../../shared/components/delete-modal/delete-modal';
import {
  HistoryRafflesModal,
  RaffleDetail,
} from '../../../../shared/components/history-raffles-modal/history-raffles-modal';
import {
  HistoryTicketModel,
  TicketHistoryData,
} from '../../../../shared/components/history-ticket-model/history-ticket-model';
import { Ticket } from '../../../../core/interfaces/ticket.interface';
import {
  DEFAULT_MONEY_GOAL,
  BENEFICIARY_PERCENTAGE,
  WINNER_PERCENTAGE,
  TICKETS_TOTAL_COUNT,
  DEFAULT_RAFFLE_PHOTO,
} from '../../../../core/helpers/constants/dashboard-constants';
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
  HistoryRaffle,
} from '../../../../core/helpers/constants/history-constants';
import {
  TABLE_ACTION_VIEW_DETAIL,
  TABLE_ACTION_VIEW_TICKETS,
  TABLE_ACTION_DASHBOARD_DELETE,
} from '../../../../core/helpers/constants/global-constants';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, Filter, Tables, DeleteModal, HistoryRafflesModal, HistoryTicketModel],
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
    if (evento.actionId === TABLE_ACTION_VIEW_DETAIL) {
      this.onViewDetails(evento.row);
      document.getElementById(this.BTN_HISTORY_MODAL_ID)?.click();
    } else if (evento.actionId === TABLE_ACTION_VIEW_TICKETS) {
      this.onViewTicketDetails(evento.row);
      document.getElementById(this.BTN_TICKETS_MODAL_ID)?.click();
    } else if (evento.actionId === TABLE_ACTION_DASHBOARD_DELETE) {
      this.rifaSeleccionadaParaBorrar = evento.row;
      document.getElementById(this.BTN_DELETE_HISTORY_ID)?.click();
    }
  }

  confirmarEliminar(): void {
    if (this.rifaSeleccionadaParaBorrar) {
      const index = this.historyData.findIndex((r) => r.id === this.rifaSeleccionadaParaBorrar!.id);
      if (index !== -1) {
        this.historyData[index].estado = 'ELIMINADO';
      }
      this.tableData = this.getFilteredData(this.filtroActual);
      this.rifaSeleccionadaParaBorrar = null;
    }
  }

  onViewTicketDetails(raffle: HistoryRaffle): void {
    const ticketsTotalCount = raffle.boletosTotales || TICKETS_TOTAL_COUNT;
    const generatedTickets: Ticket[] = Array.from({ length: ticketsTotalCount }, (_, i) => {
      const numStr = (i + 1).toString().padStart(2, '0');
      let estado: 'disponible' | 'seleccionado' | 'ganador' = 'disponible';

      if (numStr === (raffle.ganador || '07')) {
        estado = 'ganador';
      } else if (raffle.numerosAsociados && raffle.numerosAsociados.includes(`[${numStr}]`)) {
        estado = 'seleccionado';
      } else if (!raffle.numerosAsociados && (numStr === '05' || numStr === '14')) {
        estado = 'seleccionado';
      }

      return { numero: numStr, estado };
    });

    const numerosAsociados = raffle.numerosAsociados || '[05] [07] [14]';
    const boletosComprados = raffle.numerosAsociados
      ? numerosAsociados.split(']').filter(Boolean).length
      : 3;

    this.selectedTicketData = {
      nombreGanador: raffle.ganadorName || 'Paco Briones Macias',
      boletosComprados: boletosComprados,
      numerosAsociados: numerosAsociados,
      correo: raffle.ganadorEmail || 'example@gmail.com',
      boletoGanador: raffle.ganador || '07',
      telefono: raffle.ganadorPhone || '0998452318',
      fechaUltimaCompra: '12/05/2026',
      boletos: generatedTickets,
    };
  }

  onViewDetails(raffle: HistoryRaffle): void {
    const totalCollected = raffle.recaudado;
    const moneyGoal = raffle.meta || DEFAULT_MONEY_GOAL;
    const beneficiaryPercentage =
      raffle.beneficiaryPercentage !== undefined
        ? raffle.beneficiaryPercentage
        : BENEFICIARY_PERCENTAGE;
    const winnerPercentage =
      raffle.winnerPercentage !== undefined ? raffle.winnerPercentage : WINNER_PERCENTAGE;

    const beneficiaryAmount = (totalCollected * beneficiaryPercentage) / 100;
    const winnerAmount = (totalCollected * winnerPercentage) / 100;

    this.selectedRaffle = {
      name: raffle.nombreRifa,
      foundation: raffle.fundacion,
      startDate: raffle.startDate || '10/05/2026',
      endDate: raffle.endDate || '14/05/2026',
      category: raffle.categoria,
      ticketPrice: raffle.ticketPrice || 30,
      winningTicket: raffle.ganador,
      moneyGoal: moneyGoal,
      ticketsSold: raffle.boletosVendidos,
      ticketsAvailable: raffle.boletosTotales,
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
    };
  }

  private getFilteredData(filterId: string): HistoryRaffle[] {
    let filtered = this.historyData;
    if (filterId === HISTORY_FILTER_ALL) {
      filtered = this.historyData.filter((r) => r.estado !== 'ELIMINADO');
    } else if (filterId === HISTORY_FILTER_TICKETS) {
      filtered = this.historyData.filter(
        (r) => r.estado !== 'ELIMINADO' && r.boletosVendidos === r.boletosTotales,
      );
    } else if (filterId === HISTORY_FILTER_GOAL) {
      filtered = this.historyData.filter((r) => r.estado !== 'ELIMINADO' && r.recaudado === r.meta);
    } else if (filterId === HISTORY_FILTER_DELETE) {
      filtered = this.historyData.filter((r) => r.estado === 'ELIMINADO');
    }

    return filtered.map((raffle) => ({
      ...raffle,
      boletosVendidosStr: `${raffle.boletosVendidos}/${raffle.boletosTotales}`,
      recaudadoStr: `${raffle.recaudado}/${raffle.meta} $`,
    }));
  }
}
