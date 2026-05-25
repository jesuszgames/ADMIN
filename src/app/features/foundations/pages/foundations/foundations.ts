import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Filter } from '../../../../shared/components/filter/filter';
import { Tables } from '../../../../shared/components/tables/tables';
import { DeleteModal } from '../../../../shared/components/delete-modal/delete-modal';
import { MainButton } from '../../../../shared/components/main-button/main-button';
import {
  FOUNDATION_FILTERS,
  FOUNDATION_FILTER_ALL,
  FOUNDATION_FILTER_INACTIVE,
  FOUNDATION_FILTER_DELETE,
  FOUNDATION_ROW_ACTIONS,
  MY_FOUNDATIONS_COLUMNS,
  MY_FOUNDATIONS_DATA_MOCK,
  MY_FOUNDATIONS_PRINCIPAL_HEADER,
  Foundation,
} from '../../../../core/helpers/constants/foundations-constans';
import {
  TABLE_ACTION_CHANGE_STATE,
  TABLE_ACTION_DELETE,
  TABLE_ACTION_EDIT_DETAIL,
} from '../../../../core/helpers/constants/global-constants';

@Component({
  selector: 'app-foundations',
  standalone: true,
  imports: [CommonModule, Filter, Tables, DeleteModal, MainButton],
  templateUrl: './foundations.html',
})
export class Foundations {
  principalHeader = MY_FOUNDATIONS_PRINCIPAL_HEADER;
  foundationColumns = MY_FOUNDATIONS_COLUMNS;
  foundationFilters = FOUNDATION_FILTERS;
  foundationActions = FOUNDATION_ROW_ACTIONS;

  filtroActual = FOUNDATION_FILTER_ALL;
  fundacionSeleccionadaParaBorrar: Foundation | null = null;

  private readonly BTN_DELETE_FOUNDATION_ID = 'btn-abrir-modal-delete-foundation';

  filtrarPorCategoria(id: string): void {
    this.filtroActual = id;
    this.tableData = this.getFilteredData(id);
  }

  foundationsData: Foundation[] = [...MY_FOUNDATIONS_DATA_MOCK];
  tableData: Foundation[] = [];

  constructor() {
    this.tableData = this.getFilteredData(this.filtroActual);
  }

  manejarAccion(evento: { actionId: number; row: Foundation }): void {
    if (evento.actionId === TABLE_ACTION_CHANGE_STATE) {
      const index = this.foundationsData.findIndex((f) => f.id === evento.row.id);
      if (index !== -1) {
        const current = this.foundationsData[index].estado.toUpperCase();
        if (current.includes('ACTIV') && !current.includes('DESACTIV')) {
          this.foundationsData[index].estado = 'DESACTIVADO';
        } else {
          this.foundationsData[index].estado = 'ACTIVO';
        }
        this.tableData = this.getFilteredData(this.filtroActual);
      }
    } else if (evento.actionId === TABLE_ACTION_DELETE) {
      this.fundacionSeleccionadaParaBorrar = evento.row;
      document.getElementById(this.BTN_DELETE_FOUNDATION_ID)?.click();
    } else if (evento.actionId === TABLE_ACTION_EDIT_DETAIL) {
      console.log('Editar Fundación:', evento.row);
    }
  }

  confirmarEliminar(): void {
    if (this.fundacionSeleccionadaParaBorrar) {
      const index = this.foundationsData.findIndex(
        (f) => f.id === this.fundacionSeleccionadaParaBorrar!.id,
      );
      if (index !== -1) {
        this.foundationsData[index].estado = 'ELIMINADO';
      }
      this.tableData = this.getFilteredData(this.filtroActual);
      this.fundacionSeleccionadaParaBorrar = null;
    }
  }

  private getFilteredData(filterId: string): Foundation[] {
    let filtered = this.foundationsData;
    if (filterId === FOUNDATION_FILTER_ALL) {
      filtered = this.foundationsData.filter((f) => f.estado !== 'ELIMINADO');
    } else if (filterId === FOUNDATION_FILTER_INACTIVE) {
      filtered = this.foundationsData.filter((f) => f.estado === 'DESACTIVADO');
    } else if (filterId === FOUNDATION_FILTER_DELETE) {
      filtered = this.foundationsData.filter((f) => f.estado === 'ELIMINADO');
    }
    return filtered.map((foundation) => ({ ...foundation }));
  }
}
