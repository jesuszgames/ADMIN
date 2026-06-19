import { Component, OnInit, inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RaffleService } from '../../../../core/services/api/raffle.service';
import { TicketService, BackendUnlinkLog } from '../../../../core/services/api/ticket.service';
import { Subscription } from 'rxjs';
import { RouterModule } from '@angular/router';
import { Filter } from '../../../../shared/components/filter/filter';
import { Tables } from '../../../../shared/components/tables/tables';
import { DeleteModal } from '../../../../shared/components/delete-modal/delete-modal';
import { MainButton } from '../../../../shared/components/main-button/main-button';
import { CreateRaffleModal } from '../../components/create-raffle-modal/create-raffle-modal';
import { EditTicketsModal } from '../../../../shared/components/edit-tickets-modal/edit-tickets-modal';
import { UnlinkLogs } from '../../../../shared/components/unlink-logs/unlink-logs';
import { ConfirmChangesModal } from '../../../../shared/components/confirm-changes-modal/confirm-changes-modal';
import { ModelChange } from '../../../../core/interfaces/api/model-change.interface';
import {
  TABLE_ACTION_CHANGE_STATE,
  TABLE_ACTION_DELETE,
  TABLE_ACTION_EDIT_DETAIL,
  TABLE_ACTION_EDIT_TICKETS,
  TABLE_ACTION_VIEW_UNLINK_LOGS,
} from '../../../../core/helpers/ui/constants';
import {
  MY_RAFFLES_PRINCIPAL_HEADER,
  MY_RAFFLES_COLUMNS,
  MY_RAFFLES_FILTERS,
  RAFFLE_FILTER_ALL,
  RAFFLE_FILTER_INACTIVE,
  RAFFLE_FILTER_NO_TICKETS,
  RAFFLE_FILTER_PROX_EXPIRED,
  RAFFLE_FILTER_META_COMPLETED,
  RAFFLE_STATUS_ACTIVE,
  RAFFLE_STATUS_INACTIVE,
  RAFFLE_STATUS_NO_TICKETS,
  RAFFLE_STATUS_PROX_EXPIRED,
  RAFFLE_STATUS_META_COMPLETED,
  RAFFLE_FILTER_MANUAL,
  RAFFLE_FILTER_AUTOMATIC,
  RAFFLE_FILTER_VALUES,
  STATE_DELETED,
  METHOD_AUTOMATIC,
} from '../../../../core/helpers/global/raffle.constants';
import { Raffle } from '../../../../core/interfaces/api/raffle.interface';
import { calculateRemainingTime, isDeletedStatus, isActiveStatus } from '../../../../core/helpers/ui/utils';

@Component({
  selector: 'app-raffles',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    Filter,
    Tables,
    DeleteModal,
    MainButton,
    CreateRaffleModal,
    EditTicketsModal,
    UnlinkLogs,
    ConfirmChangesModal,
  ],
  templateUrl: './my-raffles.html',
})
export class Raffles implements OnInit, OnDestroy {
  private readonly raffleService = inject(RaffleService);
  private readonly ticketService = inject(TicketService);
  private readonly cdr = inject(ChangeDetectorRef);
  private activeSub?: Subscription;

  principalHeader = MY_RAFFLES_PRINCIPAL_HEADER;
  dashboardColumns = MY_RAFFLES_COLUMNS;
  misFiltrosRifas = MY_RAFFLES_FILTERS;

  filtroActual = RAFFLE_FILTER_ALL;
  rifaSeleccionadaParaBorrar: Raffle | null = null;
  selectedRaffleForEdit: Raffle | null = null;
  selectedRaffleForTickets: Raffle | null = null;
  selectedRaffleForLogs: Raffle | null = null;
  isReadOnlyView = false;

  showConfirmModal = false;
  changesToConfirm: ModelChange[] = [];
  pendingRowToToggle: Raffle | null = null;

  private readonly BTN_DELETE_RAFFLE_ID = 'btn-abrir-modal-delete-raffle';
  private readonly BTN_CREATE_RAFFLE_ID = 'btn-abrir-modal-create-raffle';
  private readonly BTN_EDIT_TICKETS_ID = 'btn-abrir-modal-edit-tickets';

  rifasData: Raffle[] = [];
  tableData: Raffle[] = [];
  loading: boolean = false;
  isRaffleSaving = false;
  isRaffleDeleting = false;
  isRaffleUpdating = false;

  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  searchText = '';

  ngOnInit(): void {
    setTimeout(() => {
      this.cargarRifas();
    });
  }

  cargarRifas(isSilent = false): void {
    if (this.activeSub) {
      this.activeSub.unsubscribe();
    }
    if (!isSilent) {
      this.loading = true;
      this.cdr.detectChanges();
    }
    let statuses = 'ACTIVE,INACTIVE,NO-TICKETS,SOON-TO-EXPIRED,GOAL';

    let backendFilter = '';
    let drawMethod = undefined;

    if (this.filtroActual === RAFFLE_FILTER_INACTIVE) {
      statuses = 'INACTIVE';
    } else if (this.filtroActual === RAFFLE_FILTER_NO_TICKETS) {
      statuses = 'ACTIVE,INACTIVE';
      backendFilter = RAFFLE_FILTER_VALUES.NO_TICKETS;
    } else if (this.filtroActual === RAFFLE_FILTER_META_COMPLETED) {
      statuses = 'ACTIVE,INACTIVE';
      backendFilter = RAFFLE_FILTER_VALUES.GOAL;
    } else if (this.filtroActual === RAFFLE_FILTER_PROX_EXPIRED) {
      statuses = 'ACTIVE';
      backendFilter = RAFFLE_FILTER_VALUES.SOON_TO_EXPIRED;
    } else if (this.filtroActual === RAFFLE_FILTER_MANUAL) {
      drawMethod = 'MANUAL';
    } else if (this.filtroActual === RAFFLE_FILTER_AUTOMATIC) {
      drawMethod = 'AUTOMATIC';
    }

    this.activeSub = this.raffleService
      .getAll(this.currentPage, this.pageSize, this.searchText, statuses, drawMethod, backendFilter, '{"endDate":1}')
      .subscribe({
        next: (res) => {
          if (res && res.data) {
            this.totalItems = res.totalCount || 0;
            this.rifasData = res.data;
            this.tableData = this.getFilteredData();
          }
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('API Error: No se pudo cargar rifas del backend.', err);
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

  filtrarPorCategoria(id: string) {
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

  abrirCrearRifa() {
    this.selectedRaffleForEdit = null;
    this.isReadOnlyView = false;
    document.getElementById(this.BTN_CREATE_RAFFLE_ID)?.click();
  }

  manejarAccion(evento: { actionId: number; row: Record<string, unknown> }) {
    const row = evento.row as unknown as Raffle;
    try {
      const actions: Record<number, () => void> = {
        [TABLE_ACTION_CHANGE_STATE]: () => {
          try {
            const index = this.rifasData.findIndex((r) => r._id === row._id);
            if (index === -1) throw new Error();
            const current = this.rifasData[index].status;
            const currentUpper = current.toUpperCase();
 
            let nextState = RAFFLE_STATUS_ACTIVE;
            try {
              if (currentUpper.includes('INACT')) throw new Error();
              nextState = RAFFLE_STATUS_INACTIVE;
            } catch {}
 
            this.pendingRowToToggle = row;
            this.changesToConfirm = [
              {
                campo: 'Estado de la Rifa',
                anterior: current,
                nuevo: nextState,
              },
            ];
            this.showConfirmModal = true;
          } catch {}
        },
        [TABLE_ACTION_DELETE]: () => {
          this.rifaSeleccionadaParaBorrar = row;
          document.getElementById(this.BTN_DELETE_RAFFLE_ID)?.click();
        },
        [TABLE_ACTION_EDIT_DETAIL]: () => {
          this.selectedRaffleForEdit = row;
          this.isReadOnlyView = isDeletedStatus(row.status);
          document.getElementById(this.BTN_CREATE_RAFFLE_ID)?.click();
        },
        [TABLE_ACTION_EDIT_TICKETS]: () => {
          this.selectedRaffleForTickets = row;
          document.getElementById(this.BTN_EDIT_TICKETS_ID)?.click();
        },
        [TABLE_ACTION_VIEW_UNLINK_LOGS]: () => {
          this.selectedRaffleForLogs = { ...row, unlinks: [] };
          this.ticketService.getUnlinkedLogs(row._id, 1, 1000).subscribe({
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
 
  confirmarEliminar(razon: string) {
    const targetRaffle = this.rifaSeleccionadaParaBorrar;
    if (!targetRaffle || this.isRaffleDeleting) return;
 
    this.isRaffleDeleting = true;
    this.raffleService.deleteRaffle(targetRaffle._id, razon).subscribe({
      next: () => {
        this.cargarRifas();
        this.isRaffleDeleting = false;
      },
      error: (err) => {
        console.error('API Error: No se pudo eliminar la rifa.', err);
        this.isRaffleDeleting = false;
      },
    });
    this.rifaSeleccionadaParaBorrar = null;
  }
 
  confirmarCambioEstado() {
    if (this.pendingRowToToggle && this.changesToConfirm.length > 0 && !this.isRaffleUpdating) {
      const nextStatus = this.changesToConfirm[0].nuevo as string;
      this.isRaffleUpdating = true;
      this.raffleService.update(this.pendingRowToToggle._id, { status: nextStatus }).subscribe({
        next: () => {
          this.cargarRifas();
          this.isRaffleUpdating = false;
        },
        error: (err) => {
          console.error('API Error: No se pudo cambiar el estado de la rifa.', err);
          this.isRaffleUpdating = false;
        },
      });
    }
    this.cancelarCambioEstado();
  }
 
  cancelarCambioEstado() {
    this.showConfirmModal = false;
    this.changesToConfirm = [];
    this.pendingRowToToggle = null;
  }

  onSaveRaffle(raffleData: Raffle) {
    const editRaffle = this.selectedRaffleForEdit;
    this.isRaffleSaving = true;
    if (editRaffle) {
      this.raffleService.update(editRaffle._id, raffleData).subscribe({
        next: () => {
          this.cargarRifas();
          document.getElementById('btn-cerrar-modal-crear-rifa')?.click();
          this.isRaffleSaving = false;
        },
        error: (err) => {
          console.error('API Error: No se pudo actualizar la rifa.', err);
          this.isRaffleSaving = false;
        },
      });
    } else {
      this.raffleService.create(raffleData).subscribe({
        next: () => {
          this.cargarRifas();
          document.getElementById('btn-cerrar-modal-crear-rifa')?.click();
          this.isRaffleSaving = false;
        },
        error: (err) => {
          console.error('API Error: No se pudo crear la rifa.', err);
          this.isRaffleSaving = false;
        },
      });
    }
  }

  onSaveTickets(_updatedRaffle: Raffle) {
    this.cargarRifas();
    this.selectedRaffleForTickets = null;
  }

  private getFilteredData(): Raffle[] {
    return this.rifasData.map((raffle) => {
      let recStr = `${raffle.collected}$`;
      try {
        if (!raffle.goal) throw new Error();
        recStr = `${raffle.collected}/${raffle.goal} $`;
      } catch {}

      let tiempoRestanteCalculado = raffle.remainingTime;
      if (raffle.endDate) {
        tiempoRestanteCalculado = calculateRemainingTime(raffle.endDate, raffle.status);
      }

      let statusDisplay = raffle.status;
      if (isActiveStatus(raffle.status)) {
        if (raffle.soldTickets === raffle.totalTickets) {
          statusDisplay = RAFFLE_STATUS_NO_TICKETS;
        } else if (raffle.collected && raffle.goal && raffle.collected >= raffle.goal) {
          statusDisplay = RAFFLE_STATUS_META_COMPLETED;
        } else {
          try {
            const timeStr = tiempoRestanteCalculado || '';
            if (timeStr.includes('días') || timeStr.includes('día')) {
              const days = parseInt(timeStr);
              if (!isNaN(days) && days <= 2) {
                statusDisplay = RAFFLE_STATUS_PROX_EXPIRED;
              }
            } else if (timeStr.includes('horas')) {
              statusDisplay = RAFFLE_STATUS_PROX_EXPIRED;
            }
          } catch {}
        }
      }

      return {
        ...raffle,
        drawMethod: raffle.drawMethod || (METHOD_AUTOMATIC as 'AUTOMATIC' | 'MANUAL'),
        soldTicketsStr: `${raffle.soldTickets}/${raffle.totalTickets}`,
        collectedStr: recStr,
        remainingTime: tiempoRestanteCalculado,
        statusDisplay: statusDisplay,
      };
    });
  }
}
