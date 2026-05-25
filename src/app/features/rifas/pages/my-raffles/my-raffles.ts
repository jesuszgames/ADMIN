import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Filter } from '../../../../shared/components/filter/filter';
import { Tables } from '../../../../shared/components/tables/tables';
import { DeleteModal } from '../../../../shared/components/delete-modal/delete-modal';
import { MainButton } from '../../../../shared/components/main-button/main-button';
import {
  TABLE_ACTION_CHANGE_STATE,
  TABLE_ACTION_DELETE,
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
  tiempoRestante: string;
  acciones: string;
  boletosVendidosStr?: string;
  recaudadoStr?: string;
  [key: string]: unknown;
};

@Component({
  selector: 'app-raffles',
  imports: [CommonModule, RouterModule, Filter, Tables, DeleteModal, MainButton],
  templateUrl: './my-raffles.html',
})
export class Raffles {
  principalHeader = MY_RAFFLES_PRINCIPAL_HEADER;
  dashboardColumns = MY_RAFFLES_COLUMNS;
  misFiltrosRifas = MY_RAFFLES_FILTERS;

  filtroActual = RAFFLE_FILTER_ALL;
  rifaSeleccionadaParaBorrar: Raffle | null = null;

  private readonly BTN_DELETE_RAFFLE_ID = 'btn-abrir-modal-delete-raffle';

  filtrarPorCategoria(id: string) {
    this.filtroActual = id;
    this.tableData = this.getFilteredData(id);
  }

  rifasData: Raffle[] = [...MY_RAFFLES_DATA_MOCK];

  tableData: Raffle[] = this.getFilteredData(RAFFLE_FILTER_ALL);

  manejarAccion(evento: { actionId: number; row: Raffle }) {
    if (evento.actionId === TABLE_ACTION_CHANGE_STATE) {
      const index = this.rifasData.findIndex((r) => r.id === evento.row.id);
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
      this.rifaSeleccionadaParaBorrar = evento.row;
      document.getElementById(this.BTN_DELETE_RAFFLE_ID)?.click();
    }
  }

  confirmarEliminar() {
    if (this.rifaSeleccionadaParaBorrar) {
      this.rifasData = this.rifasData.filter((r) => r.id !== this.rifaSeleccionadaParaBorrar!.id);
      this.tableData = this.getFilteredData(this.filtroActual);
      this.rifaSeleccionadaParaBorrar = null;
    }
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
