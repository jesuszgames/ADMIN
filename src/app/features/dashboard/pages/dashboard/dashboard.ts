import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { SimpleCard } from '../../components/simple-card/simple-card';
import { Tables } from '../../../../shared/components/tables/tables';
import { DeleteModal } from '../../../../shared/components/delete-modal/delete-modal';
import { HistoryRafflesModal } from '../../../../shared/components/history-raffles-modal/history-raffles-modal';
import { HistoryTicketModel } from '../../../../shared/components/history-ticket-model/history-ticket-model';
import { RaffleDetail } from '../../../../core/interfaces/api/raffle-detail.interface';
import { TicketHistoryData } from '../../../../core/interfaces/api/ticket-history-data.interface';
import { RaffleService } from '../../../../core/services/api/raffle.service';
import { TicketService } from '../../../../core/services/api/ticket.service';
import { mapRaffleDetails, mapTicketDetails, isDeletedStatus } from '../../../../core/helpers/ui/utils';
import {
  DEFAULT_USER_NAME,
  DASHBOARD_PRINCIPAL_HEADER,
  DASHBOARD_COLUMNS,
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
  private readonly raffleService = inject(RaffleService);
  private readonly ticketService = inject(TicketService);
  private readonly cdr = inject(ChangeDetectorRef);

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
  loading = false;

  ngOnInit(): void {
    this.initWelcomeMessage();
    this.cargarRifas();
  }

  cargarRifas(): void {
    this.loading = true;
    this.cdr.detectChanges();
    this.raffleService.getAll().subscribe({
      next: (res) => {
        if (res && res.data) {
          this.recentRaffles = res.data;
          this.updateTableData();
          this.updateCardMetrics();
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('API Error: No se pudieron cargar las rifas para el dashboard.', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  updateTableData(): void {
    const nowTime = Date.now();
    this.tableData = this.recentRaffles
      .filter((r) => {
        const statusUpper = (r.status || '').toUpperCase();
        const isEnded =
          statusUpper === 'FINISHED' ||
          statusUpper === 'PENDING-DRAW' ||
          statusUpper === 'PENDING_DRAW';

        if (!isEnded) return false;

        if (isDeletedStatus(r.status)) {
          return false;
        }

        const completionDate = r.endDate ? new Date(r.endDate) : null;
        if (completionDate) {
          const diffMs = Math.abs(nowTime - completionDate.getTime());
          return diffMs <= 24 * 60 * 60 * 1000;
        }
        return false;
      })
      .map((raffle) => {
        let recStr = `${raffle.collected}$`;
        try {
          if (!raffle.goal) throw new Error();
          recStr = `${raffle.collected}/${raffle.goal} $`;
        } catch { }
        return {
          ...raffle,
          drawMethod: raffle.drawMethod || (METHOD_AUTOMATIC as 'AUTOMATIC' | 'MANUAL'),
          collectedStr: recStr,
        };
      });
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

      // Calculate active raffles
      const totalActive = activeRaffles.filter((r) => {
        const est = String(r.status).toUpperCase();
        const isFinished = est === 'FINISHED';
        return !isFinished && !isDeletedStatus(r.status);
      }).length;

      // Calculate raffles without tickets (sold out)
      const totalNoTickets = activeRaffles.filter((r) => {
        const est = String(r.status).toUpperCase();
        return est === 'NO-TICKETS' || est === 'NO TICKETS';
      }).length;

      // Calculate finished raffles
      const totalFinished = activeRaffles.filter((r) => {
        const est = String(r.status).toUpperCase();
        return est === 'FINISHED';
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
          label: 'Premiados',
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

  onViewTicketDetails(raffle: Raffle) {
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

  onViewDetails(raffle: Raffle) {
    this.selectedRaffle = mapRaffleDetails(raffle);
  }

  recentRaffles: Raffle[] = [];
  tableData: Raffle[] = [];
}
