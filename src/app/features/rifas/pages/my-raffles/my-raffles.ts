import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Filter } from '../../../../shared/components/filter/filter';
import { Tables } from '../../../../shared/components/tables/tables';
import { DeleteModal } from '../../../../shared/components/delete-modal/delete-modal';
import { MainButton } from '../../../../shared/components/main-button/main-button';
import { CreateRaffleModal } from '../../../../shared/components/create-raffle-modal/create-raffle-modal';
import { EditTicketsModal } from '../../../../shared/components/edit-tickets-modal/edit-tickets-modal';
import {
  TABLE_ACTION_CHANGE_STATE,
  TABLE_ACTION_DELETE,
  TABLE_ACTION_EDIT_DETAIL,
  TABLE_ACTION_EDIT_TICKETS,
} from '../../../../core/helpers/constants/global-constants';
import {
  MY_RAFFLES_PRINCIPAL_HEADER,
  MY_RAFFLES_COLUMNS,
  MY_RAFFLES_FILTERS,
  MY_RAFFLES_DATA_MOCK,
  RAFFLE_FILTER_ALL,
  RAFFLE_FILTER_NO_TICKETS,
  RAFFLE_FILTER_PROX_EXPIRED,
  RAFFLE_FILTER_META_COMPLETED,
  RAFFLE_STATUS_ACTIVE,
  RAFFLE_STATUS_INACTIVE,
  RAFFLE_STATUS_NO_TICKETS,
  RAFFLE_STATUS_PROX_EXPIRED,
  RAFFLE_STATUS_META_COMPLETED,
} from '../../../../core/helpers/constants/my-raffles-constants';
import { Raffle } from '../../../../core/interfaces/raffle.interface';

@Component({
  selector: 'app-raffles',
  imports: [
    CommonModule,
    RouterModule,
    Filter,
    Tables,
    DeleteModal,
    MainButton,
    CreateRaffleModal,
    EditTicketsModal,
  ],
  templateUrl: './my-raffles.html',
})
export class Raffles {
  principalHeader = MY_RAFFLES_PRINCIPAL_HEADER;
  dashboardColumns = MY_RAFFLES_COLUMNS;
  misFiltrosRifas = MY_RAFFLES_FILTERS;

  filtroActual = RAFFLE_FILTER_ALL;
  rifaSeleccionadaParaBorrar: Raffle | null = null;
  selectedRaffleForEdit: Raffle | null = null;
  selectedRaffleForTickets: Raffle | null = null;

  private readonly BTN_DELETE_RAFFLE_ID = 'btn-abrir-modal-delete-raffle';
  private readonly BTN_CREATE_RAFFLE_ID = 'btn-abrir-modal-create-raffle';
  private readonly BTN_EDIT_TICKETS_ID = 'btn-abrir-modal-edit-tickets';

  filtrarPorCategoria(id: string) {
    this.filtroActual = id;
    this.tableData = this.getFilteredData(id);
  }

  rifasData: Raffle[] = [...MY_RAFFLES_DATA_MOCK];

  tableData: Raffle[] = this.getFilteredData(RAFFLE_FILTER_ALL);

  abrirCrearRifa() {
    this.selectedRaffleForEdit = null;
    document.getElementById(this.BTN_CREATE_RAFFLE_ID)?.click();
  }

  manejarAccion(evento: { actionId: number; row: Record<string, unknown> }) {
    const row = evento.row as unknown as Raffle;
    if (evento.actionId === TABLE_ACTION_CHANGE_STATE) {
      const index = this.rifasData.findIndex((r) => r.id === row.id);
      if (index !== -1) {
        const current = this.rifasData[index].estado.toUpperCase();
        if (current.includes('INACT')) {
          this.rifasData[index].estado = RAFFLE_STATUS_ACTIVE;
        } else {
          this.rifasData[index].estado = RAFFLE_STATUS_INACTIVE;
        }
        this.tableData = this.getFilteredData(this.filtroActual);
      }
    } else if (evento.actionId === TABLE_ACTION_DELETE) {
      this.rifaSeleccionadaParaBorrar = row;
      document.getElementById(this.BTN_DELETE_RAFFLE_ID)?.click();
    } else if (evento.actionId === TABLE_ACTION_EDIT_DETAIL) {
      this.selectedRaffleForEdit = row;
      document.getElementById(this.BTN_CREATE_RAFFLE_ID)?.click();
    } else if (evento.actionId === TABLE_ACTION_EDIT_TICKETS) {
      this.selectedRaffleForTickets = row;
      document.getElementById(this.BTN_EDIT_TICKETS_ID)?.click();
    }
  }

  confirmarEliminar() {
    if (this.rifaSeleccionadaParaBorrar) {
      this.rifasData = this.rifasData.filter((r) => r.id !== this.rifaSeleccionadaParaBorrar!.id);
      this.tableData = this.getFilteredData(this.filtroActual);
      this.rifaSeleccionadaParaBorrar = null;
    }
  }

  onSaveRaffle(raffleData: Raffle) {
    if (raffleData.id) {
      const index = this.rifasData.findIndex((r) => r.id === raffleData.id);
      if (index !== -1) {
        this.rifasData[index] = {
          ...raffleData,
          boletosVendidosStr: `${raffleData.boletosVendidos || 0}/${raffleData.boletosTotales || 100}`,
          recaudadoStr: raffleData.meta
            ? `${raffleData.recaudado || 0}/${raffleData.meta} $`
            : `${raffleData.recaudado || 0}$`,
        };
      }
    } else {
      const newId =
        this.rifasData.length > 0 ? Math.max(...this.rifasData.map((r) => r.id)) + 1 : 1;
      const newRaffle: Raffle = {
        ...raffleData,
        id: newId,
        estado: RAFFLE_STATUS_ACTIVE,
        boletosVendidos: 0,
        recaudado: 0,
        ganador: '',
        tiempoRestante: '15 dias',
        acciones: '',
        boletosVendidosStr: `0/${raffleData.boletosTotales || 100}`,
        recaudadoStr: raffleData.meta ? `0/${raffleData.meta} $` : `0$`,
      };
      this.rifasData.push(newRaffle);
    }
    this.tableData = this.getFilteredData(this.filtroActual);
    this.selectedRaffleForEdit = null;
  }

  onSaveTickets(updatedRaffle: Raffle) {
    const index = this.rifasData.findIndex((r) => r.id === updatedRaffle.id);
    if (index !== -1) {
      this.rifasData[index] = updatedRaffle;
      this.tableData = this.getFilteredData(this.filtroActual);
    }
    this.selectedRaffleForTickets = null;
  }

  private getFilteredData(filterId: string): Raffle[] {
    let filtered = this.rifasData;
    if (filterId === RAFFLE_FILTER_NO_TICKETS) {
      filtered = this.rifasData.filter((r) => r.estado === RAFFLE_STATUS_NO_TICKETS);
    } else if (filterId === RAFFLE_FILTER_PROX_EXPIRED) {
      filtered = this.rifasData.filter((r) => r.estado === RAFFLE_STATUS_PROX_EXPIRED);
    } else if (filterId === RAFFLE_FILTER_META_COMPLETED) {
      filtered = this.rifasData.filter((r) => r.estado === RAFFLE_STATUS_META_COMPLETED);
    }

    return filtered.map((raffle) => ({
      ...raffle,
      boletosVendidosStr: `${raffle.boletosVendidos}/${raffle.boletosTotales}`,
      recaudadoStr: raffle.meta ? `${raffle.recaudado}/${raffle.meta} $` : `${raffle.recaudado}$`,
    }));
  }
}
