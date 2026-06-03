import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RaffleService } from '../../../../core/services/api/raffle.service';
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
  MY_RAFFLES_DATA_MOCK,
  RAFFLE_FILTER_ALL,
  RAFFLE_FILTER_NO_TICKETS,
  RAFFLE_FILTER_PROX_EXPIRED,
  RAFFLE_FILTER_META_COMPLETED,
  RAFFLE_FILTER_DELETE,
  RAFFLE_STATUS_ACTIVE,
  RAFFLE_STATUS_INACTIVE,
  RAFFLE_STATUS_NO_TICKETS,
  RAFFLE_STATUS_PROX_EXPIRED,
  RAFFLE_STATUS_META_COMPLETED,
  RAFFLE_FILTER_MANUAL,
  RAFFLE_FILTER_AUTOMATIC,
  STATE_DELETED,
  METHOD_AUTOMATIC,
} from '../../../../core/helpers/global/raffle.constants';
import { Raffle } from '../../../../core/interfaces/api/raffle.interface';
import { generateObjectId } from '../../../../core/helpers/ui/utils';

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
export class Raffles implements OnInit {
  private readonly raffleService = inject(RaffleService);

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

  ngOnInit(): void {
    this.cargarRifas();
  }

  cargarRifas(): void {
    this.loading = true;
    this.raffleService.getAll().subscribe({
      next: (res) => {
        if (res && res.data) {
          this.rifasData = res.data;
          this.tableData = this.getFilteredData(this.filtroActual);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('API Error: No se pudo cargar rifas del backend.', err);
        this.loading = false;
      },
    });
  }

  filtrarPorCategoria(id: string) {
    this.filtroActual = id;
    this.tableData = this.getFilteredData(id);
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
            } catch { }

            this.pendingRowToToggle = row;
            this.changesToConfirm = [
              {
                campo: 'Estado de la Rifa',
                anterior: current,
                nuevo: nextState,
              },
            ];
            this.showConfirmModal = true;
          } catch { }
        },
        [TABLE_ACTION_DELETE]: () => {
          this.rifaSeleccionadaParaBorrar = row;
          document.getElementById(this.BTN_DELETE_RAFFLE_ID)?.click();
        },
        [TABLE_ACTION_EDIT_DETAIL]: () => {
          this.selectedRaffleForEdit = row;
          this.isReadOnlyView = row.status === STATE_DELETED;
          document.getElementById(this.BTN_CREATE_RAFFLE_ID)?.click();
        },
        [TABLE_ACTION_EDIT_TICKETS]: () => {
          this.selectedRaffleForTickets = row;
          document.getElementById(this.BTN_EDIT_TICKETS_ID)?.click();
        },
        [TABLE_ACTION_VIEW_UNLINK_LOGS]: () => {
          this.selectedRaffleForLogs = row;
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

  confirmarCambioEstado() {
    if (this.pendingRowToToggle && this.changesToConfirm.length > 0) {
      const nextStatus = this.changesToConfirm[0].nuevo as string;
      this.raffleService.update(this.pendingRowToToggle._id, { status: nextStatus }).subscribe({
        next: () => {
          this.cargarRifas();
        },
        error: (err) => {
          console.error('API Error: No se pudo cambiar el estado de la rifa.', err);
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

  calculateRemainingTime(endDateStr: string): string {
    if (!endDateStr) return '0 días';
    try {
      let end: Date;
      if (endDateStr.includes('-')) {
        const parts = endDateStr.split('-');
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        end = new Date(year, month, day);
      } else if (endDateStr.includes('/')) {
        const parts = endDateStr.split('/');
        if (parts[0].length === 4) {
          const year = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const day = parseInt(parts[2], 10);
          end = new Date(year, month, day);
        } else {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const year = parseInt(parts[2], 10);
          end = new Date(year, month, day);
        }
      } else {
        end = new Date(endDateStr);
      }

      const today = new Date();

      end.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      const diffTime = end.getTime() - today.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        return '0 días';
      } else if (diffDays === 0) {
        const hours = 24 - new Date().getHours();
        return `${hours} horas`;
      } else if (diffDays === 1) {
        return '1 día';
      } else {
        return `${diffDays} días`;
      }
    } catch {
      return '';
    }
  }

  onSaveRaffle(raffleData: Raffle) {
    const editRaffle = this.selectedRaffleForEdit;
    if (editRaffle) {
      this.raffleService.update(editRaffle._id, raffleData).subscribe({
        next: () => {
          this.cargarRifas();
        },
        error: (err) => {
          console.error('API Error: No se pudo actualizar la rifa.', err);
        },
      });
    } else {
      this.raffleService.create(raffleData).subscribe({
        next: () => {
          this.cargarRifas();
        },
        error: (err) => {
          console.error('API Error: No se pudo crear la rifa.', err);
        },
      });
    }
    this.selectedRaffleForEdit = null;
  }

  onSaveTickets(updatedRaffle: Raffle) {
    this.cargarRifas();
    this.selectedRaffleForTickets = null;
  }

  private getFilteredData(filterId: string): Raffle[] {
    const mappedRaffles = this.rifasData.map((raffle) => {
      let recStr = `${raffle.collected}$`;
      try {
        if (!raffle.goal) throw new Error();
        recStr = `${raffle.collected}/${raffle.goal} $`;
      } catch { }

      let tiempoRestanteCalculado = raffle.remainingTime;
      if (raffle.endDate) {
        tiempoRestanteCalculado = this.calculateRemainingTime(raffle.endDate);
      }

      let statusDisplay = raffle.status;
      if (raffle.status === 'ACTIVA' || raffle.status === 'ACTIVO') {
        if (raffle.soldTickets === raffle.totalTickets) {
          statusDisplay = 'SIN BOLETOS';
        } else if (raffle.collected && raffle.goal && raffle.collected >= raffle.goal) {
          statusDisplay = 'META COMPLETADA';
        } else {
          try {
            const timeStr = tiempoRestanteCalculado || '';
            if (timeStr.includes('días') || timeStr.includes('día')) {
              const days = parseInt(timeStr);
              if (!isNaN(days) && days <= 2) {
                statusDisplay = 'PROXIMO A VENCER';
              }
            } else if (timeStr.includes('horas')) {
              statusDisplay = 'PROXIMO A VENCER';
            }
          } catch { }
        }
      }

      return {
        ...raffle,
        drawMethod: raffle.drawMethod || (METHOD_AUTOMATIC as 'AUTOMATICO' | 'MANUAL'),
        soldTicketsStr: `${raffle.soldTickets}/${raffle.totalTickets}`,
        collectedStr: recStr,
        remainingTime: tiempoRestanteCalculado,
        statusDisplay: statusDisplay
      };
    });

    let filtered = mappedRaffles;
    if (filterId === RAFFLE_FILTER_DELETE) {
      filtered = mappedRaffles.filter((r) => r.status === STATE_DELETED);
    } else {
      try {
        const filterActions: Record<string, () => typeof mappedRaffles> = {
          [RAFFLE_FILTER_MANUAL]: () => mappedRaffles.filter((r) => r.drawMethod === 'MANUAL'),
          [RAFFLE_FILTER_AUTOMATIC]: () =>
            mappedRaffles.filter((r) => r.drawMethod === 'AUTOMATICO'),
          [RAFFLE_FILTER_NO_TICKETS]: () =>
            mappedRaffles.filter((r) => r.statusDisplay === 'SIN BOLETOS'),
          [RAFFLE_FILTER_PROX_EXPIRED]: () =>
            mappedRaffles.filter((r) => r.statusDisplay === 'PROXIMO A VENCER'),
          [RAFFLE_FILTER_META_COMPLETED]: () =>
            mappedRaffles.filter((r) => r.statusDisplay === 'META COMPLETADA'),
        };

        const filterFn = filterActions[filterId];
        if (!filterFn) throw new Error();
        filtered = filterFn();
      } catch { }

      filtered = filtered.filter((r) => r.status !== STATE_DELETED);
    }

    return filtered.map((r) => ({ ...r, status: r.statusDisplay }));
  }
}

