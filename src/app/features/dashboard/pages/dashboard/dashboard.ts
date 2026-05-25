import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SimpleCard } from '../../components/simple-card/simple-card';
import { Tables } from '../../../../shared/components/tables/tables';
import { DeleteModal } from '../../../../shared/components/delete-modal/delete-modal';
import {
  HistoryRafflesModal,
  RaffleDetail,
} from '../../../../shared/components/history-raffles-modal/history-raffles-modal';
import {
  HistoryTicketModel,
  TicketHistoryData,
  Ticket,
} from '../../../../shared/components/history-ticket-model/history-ticket-model';
import {
  DEFAULT_USER_NAME,
  DASHBOARD_PRINCIPAL_HEADER,
  DASHBOARD_CARDS,
  DASHBOARD_COLUMNS,
  DEFAULT_MONEY_GOAL,
  BENEFICIARY_PERCENTAGE,
  WINNER_PERCENTAGE,
  TICKETS_TOTAL_COUNT,
  RECENT_RAFFLES_MOCK,
  DEFAULT_RAFFLE_PHOTO,
  PERSO_PAGE_SIZE,
} from '../../../../core/helpers/constants/dashboard-constants';
import {
  TABLE_ACTION_VIEW_DETAIL,
  TABLE_ACTION_VIEW_TICKETS,
  TABLE_ACTION_DASHBOARD_DELETE,
  HISTORIAL_RAFFLE_OPTIONS,
} from '../../../../core/helpers/constants/global-constants';

export type Raffle = {
  id: number;
  nombreRifa: string;
  fundacion: string;
  categoria: string;
  estado: string;
  boletosVendidos: number;
  boletosTotales: number;
  recaudado: number;
  meta: number | null;
  ganador: string;
  acciones: string;
  beneficiaryPercentage?: number;
  winnerPercentage?: number;
  ticketPrice?: number;
  photo?: string;
  startDate?: string;
  endDate?: string;
  blogCardText?: string;
  blogDetailText?: string;
  ganadorName?: string;
  ganadorEmail?: string;
  ganadorPhone?: string;
  numerosAsociados?: string;
  recaudadoStr?: string;
  [key: string]: unknown;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SimpleCard, CommonModule, Tables, DeleteModal, HistoryRafflesModal, HistoryTicketModel],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  userName = DEFAULT_USER_NAME;
  principalHeader = DASHBOARD_PRINCIPAL_HEADER;
  selectedRaffle: RaffleDetail | null = null;
  selectedTicketData: TicketHistoryData | null = null;

  protected readonly cards = DASHBOARD_CARDS;
  dashboardColumns = DASHBOARD_COLUMNS;
  dashboardActions = HISTORIAL_RAFFLE_OPTIONS;

  rifaSeleccionadaParaBorrar: Raffle | null = null;
  rifaSeleccionadaParaVer: Raffle | null = null;

  pageSize = PERSO_PAGE_SIZE;

  private readonly BTN_HISTORY_MODAL_ID = 'btn-abrir-modal-history';
  private readonly BTN_TICKETS_MODAL_ID = 'btn-abrir-modal-tickets';
  private readonly BTN_DELETE_MODAL_ID = 'btn-abrir-modal-delete';

  manejarAccion(evento: { actionId: number; row: Raffle }) {
    if (evento.actionId === TABLE_ACTION_VIEW_DETAIL) {
      this.rifaSeleccionadaParaVer = evento.row;
      this.onViewDetails(evento.row);
      document.getElementById(this.BTN_HISTORY_MODAL_ID)?.click();
    } else if (evento.actionId === TABLE_ACTION_VIEW_TICKETS) {
      this.onViewTicketDetails(evento.row);
      document.getElementById(this.BTN_TICKETS_MODAL_ID)?.click();
    } else if (evento.actionId === TABLE_ACTION_DASHBOARD_DELETE) {
      this.rifaSeleccionadaParaBorrar = evento.row;
      document.getElementById(this.BTN_DELETE_MODAL_ID)?.click();
    }
  }

  confirmarEliminar() {
    if (this.rifaSeleccionadaParaBorrar) {
      this.recentRaffles = this.recentRaffles.filter((r) => r.id !== this.rifaSeleccionadaParaBorrar!.id);
      this.tableData = this.recentRaffles.map((raffle) => ({
        ...raffle,
        recaudadoStr: raffle.meta ? `${raffle.recaudado}/${raffle.meta} $` : `${raffle.recaudado}$`,
      }));
      this.rifaSeleccionadaParaBorrar = null;
    }
  }

  onViewTicketDetails(raffle: Raffle) {
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

  onViewDetails(raffle: Raffle) {
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

  recentRaffles: Raffle[] = RECENT_RAFFLES_MOCK;

  tableData = this.recentRaffles.map((raffle) => ({
    ...raffle,
    recaudadoStr: raffle.meta ? `${raffle.recaudado}/${raffle.meta} $` : `${raffle.recaudado}$`,
  }));
}
