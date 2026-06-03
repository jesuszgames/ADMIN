import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SimpleCard } from '../../components/simple-card/simple-card';
import { Tables } from '../../../../shared/components/tables/tables';
import { DeleteModal } from '../../../../shared/components/delete-modal/delete-modal';
import { HistoryRafflesModal } from '../../../../shared/components/history-raffles-modal/history-raffles-modal';
import { HistoryTicketModel } from '../../../../shared/components/history-ticket-model/history-ticket-model';
import { Ticket } from '../../../../core/interfaces/api/ticket.interface';
import { RaffleDetail } from '../../../../core/interfaces/api/raffle-detail.interface';
import { TicketHistoryData } from '../../../../core/interfaces/api/ticket-history-data.interface';
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
  HISTORY_ROW_ACTIONS,
} from '../../../../core/helpers/global/dashboard.constants';
import { UnlinkLogs } from '../../../../shared/components/unlink-logs/unlink-logs';
import {
  TABLE_ACTION_VIEW_DETAIL,
  TABLE_ACTION_VIEW_TICKETS,
  TABLE_ACTION_DASHBOARD_DELETE,
  TABLE_ACTION_VIEW_UNLINK_LOGS,
} from '../../../../core/helpers/ui/constants';
import {
  STATE_DELETED,
  METHOD_AUTOMATIC,
} from '../../../../core/helpers/global/raffle.constants';
import { Raffle } from '../../../../core/interfaces/api/raffle.interface';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    SimpleCard,
    CommonModule,
    Tables,
    DeleteModal,
    HistoryRafflesModal,
    HistoryTicketModel,
    UnlinkLogs,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  userName = DEFAULT_USER_NAME;
  principalHeader = DASHBOARD_PRINCIPAL_HEADER;
  selectedRaffle: RaffleDetail | null = null;
  selectedTicketData: TicketHistoryData | null = null;
  selectedRaffleForLogs: Raffle | null = null;

  cards: any[] = [];
  welcomeGreeting: string = '';
  currentDate: string = '';

  dashboardColumns = DASHBOARD_COLUMNS;
  dashboardActions = HISTORY_ROW_ACTIONS;

  rifaSeleccionadaParaBorrar: Raffle | null = null;
  rifaSeleccionadaParaVer: Raffle | null = null;

  pageSize = PERSO_PAGE_SIZE;

  ngOnInit(): void {
    this.initWelcomeMessage();
    this.updateCardMetrics();
  }

  private initWelcomeMessage() {
    try {
      const now = new Date();
      const hour = now.getHours();
      let greeting = '¡Hola';
      if (hour >= 6 && hour < 12) {
        greeting = '¡Buenos días';
      } else if (hour >= 12 && hour < 19) {
        greeting = '¡Buenas tardes';
      } else {
        greeting = '¡Buenas noches';
      }
      this.welcomeGreeting = greeting;

      const formattedDate = new Intl.DateTimeFormat('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(now);
      this.currentDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    } catch {
      this.welcomeGreeting = '¡Bienvenido';
      this.currentDate = '';
    }
  }

  updateCardMetrics() {
    try {
      const activeRaffles = this.recentRaffles.filter((r) => r.status !== STATE_DELETED);

      // Calculate total collected
      const totalCollected = activeRaffles.reduce((sum, r) => sum + (r.collected || 0), 0);

      // Calculate beneficiaries (unique foundation names)
      const uniqueFoundations = new Set(activeRaffles.map((r) => r.foundation).filter(Boolean));
      const totalBeneficiaries = uniqueFoundations.size;

      // Calculate winners (count of raffles that have a winning ticket designated)
      const totalWinners = activeRaffles.filter((r) => r.winner && r.winner !== '').length;

      // Calculate active raffles (state !== 'FINALIZADO' && state !== 'FINALIZADA')
      const totalActive = activeRaffles.filter((r) => {
        const est = String(r.status).toUpperCase();
        return est !== 'FINALIZADO' && est !== 'FINALIZADA' && est !== 'ELIMINADO';
      }).length;

      // Calculate raffles without tickets (sold out)
      const totalNoTickets = activeRaffles.filter(
        (r) => String(r.status).toUpperCase() === 'SIN BOLETOS',
      ).length;

      // Calculate finished raffles (finalizado/finalizada)
      const totalFinished = activeRaffles.filter((r) => {
        const est = String(r.status).toUpperCase();
        return est === 'FINALIZADO' || est === 'FINALIZADA';
      }).length;

      this.cards = [
        {
          label: 'Recaudado',
          value: `${totalCollected.toLocaleString('es-MX')} $`,
          icon: 'bi-cash-coin',
          color: 'success',
        },
        {
          label: 'Beneficiarios',
          value: String(totalBeneficiaries),
          icon: 'bi-heart-fill',
          color: 'danger',
        },
        {
          label: 'Ganadores',
          value: String(totalWinners),
          icon: 'bi-trophy-fill',
          color: 'warning',
        },
        {
          label: 'Activas',
          value: String(totalActive),
          icon: 'bi-play-circle-fill',
          color: 'info',
        },
        {
          label: 'Sin boletos',
          value: String(totalNoTickets),
          icon: 'bi-ticket-detailed-fill',
          color: 'secondary',
        },
        {
          label: 'Finalizados',
          value: String(totalFinished),
          icon: 'bi-check-circle-fill',
          color: 'primary',
        },
      ];
    } catch {
      this.cards = [];
    }
  }

  private readonly BTN_HISTORY_MODAL_ID = 'btn-abrir-modal-history';
  private readonly BTN_TICKETS_MODAL_ID = 'btn-abrir-modal-tickets';
  private readonly BTN_DELETE_MODAL_ID = 'btn-abrir-modal-delete';

  manejarAccion(evento: { actionId: number; row: Raffle }) {
    try {
      const actions: Record<number, () => void> = {
        [TABLE_ACTION_VIEW_DETAIL]: () => {
          this.rifaSeleccionadaParaVer = evento.row;
          this.onViewDetails(evento.row);
          document.getElementById(this.BTN_HISTORY_MODAL_ID)?.click();
        },
        [TABLE_ACTION_VIEW_TICKETS]: () => {
          this.onViewTicketDetails(evento.row);
          document.getElementById(this.BTN_TICKETS_MODAL_ID)?.click();
        },
        [TABLE_ACTION_DASHBOARD_DELETE]: () => {
          this.rifaSeleccionadaParaBorrar = evento.row;
          document.getElementById(this.BTN_DELETE_MODAL_ID)?.click();
        },
        [TABLE_ACTION_VIEW_UNLINK_LOGS]: () => {
          this.selectedRaffleForLogs = evento.row;
          document.getElementById('btn-abrir-modal-unlink-logs')?.click();
        },
      };

      const action = actions[evento.actionId];
      if (!action) throw new Error();
      action();
    } catch { }
  }

  confirmarEliminar(razon: string) {
    try {
      const targetRaffle = this.rifaSeleccionadaParaBorrar;
      if (!targetRaffle) throw new Error();
      const index = this.recentRaffles.findIndex((r) => r._id === targetRaffle._id);
      if (index === -1) throw new Error();
      this.recentRaffles[index].status = STATE_DELETED;
      this.recentRaffles[index].deleteReason = razon;

      this.tableData = this.recentRaffles
        .filter((r) => r.status !== STATE_DELETED)
        .map((raffle) => {
          let recStr = `${raffle.collected}$`;
          try {
            if (!raffle.goal) throw new Error();
            recStr = `${raffle.collected}/${raffle.goal} $`;
          } catch { }
          return {
            ...raffle,
            drawMethod: raffle.drawMethod || METHOD_AUTOMATIC,
            collectedStr: recStr,
          };
        });
      this.updateCardMetrics();
      this.rifaSeleccionadaParaBorrar = null;
    } catch { }
  }

  onViewTicketDetails(raffle: Raffle) {
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

  onViewDetails(raffle: Raffle) {
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

  recentRaffles: Raffle[] = RECENT_RAFFLES_MOCK;

  tableData = this.recentRaffles
    .filter((r) => r.status !== STATE_DELETED)
    .map((raffle) => ({
      ...raffle,
      drawMethod: raffle.drawMethod || 'AUTOMATICO',
      collectedStr: raffle.goal ? `${raffle.collected}/${raffle.goal} $` : `${raffle.collected}$`,
    }));
}
