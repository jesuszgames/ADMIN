import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Filter } from '../../../../shared/components/filter/filter';
import { Tables } from '../../../../shared/components/tables/tables';
import { DeleteModal } from '../../../../shared/components/delete-modal/delete-modal';
import { MainButton } from '../../../../shared/components/main-button/main-button';
import { CreateFoundationModal } from '../../../../shared/components/create-foundation-modal/create-foundation-modal';
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
  STATE_ACTIVE,
  STATE_INACTIVE,
  STATE_DELETED,
} from '../../../../core/helpers/constants/global-constants';

@Component({
  selector: 'app-foundations',
  standalone: true,
  imports: [CommonModule, Filter, Tables, DeleteModal, MainButton, CreateFoundationModal],
  templateUrl: './foundations.html',
})
export class Foundations {
  principalHeader = MY_FOUNDATIONS_PRINCIPAL_HEADER;
  foundationColumns = MY_FOUNDATIONS_COLUMNS;
  foundationFilters = FOUNDATION_FILTERS;
  foundationActions = FOUNDATION_ROW_ACTIONS;

  filtroActual = FOUNDATION_FILTER_ALL;
  fundacionSeleccionadaParaBorrar: Foundation | null = null;
  selectedFoundationForEdit: Foundation | null = null;

  private readonly BTN_DELETE_FOUNDATION_ID = 'btn-abrir-modal-delete-foundation';
  private readonly BTN_CREATE_FOUNDATION_ID = 'btn-abrir-modal-create-foundation';

  filtrarPorCategoria(id: string): void {
    this.filtroActual = id;
    this.tableData = this.getFilteredData(id);
  }

  foundationsData: Foundation[] = [...MY_FOUNDATIONS_DATA_MOCK];
  tableData: Foundation[] = [];

  constructor() {
    this.tableData = this.getFilteredData(this.filtroActual);
  }

  abrirCrearFundacion(): void {
    this.selectedFoundationForEdit = null;
    document.getElementById(this.BTN_CREATE_FOUNDATION_ID)?.click();
  }

  manejarAccion(evento: { actionId: number; row: Record<string, unknown> }): void {
    const row = evento.row as unknown as Foundation;
    if (evento.actionId === TABLE_ACTION_CHANGE_STATE) {
      const index = this.foundationsData.findIndex((f) => f.id === row.id);
      if (index !== -1) {
        const current = this.foundationsData[index].estado.toUpperCase();
        if (current.includes('ACTIV') && !current.includes('DESACTIV')) {
          this.foundationsData[index].estado = STATE_INACTIVE;
        } else {
          this.foundationsData[index].estado = STATE_ACTIVE;
        }
        this.tableData = this.getFilteredData(this.filtroActual);
      }
    } else if (evento.actionId === TABLE_ACTION_DELETE) {
      this.fundacionSeleccionadaParaBorrar = row;
      document.getElementById(this.BTN_DELETE_FOUNDATION_ID)?.click();
    } else if (evento.actionId === TABLE_ACTION_EDIT_DETAIL) {
      this.selectedFoundationForEdit = row;
      document.getElementById(this.BTN_CREATE_FOUNDATION_ID)?.click();
    }
  }

  onSaveFoundation(foundData: Foundation): void {
    if (this.selectedFoundationForEdit) {
      const index = this.foundationsData.findIndex(
        (f) => f.id === this.selectedFoundationForEdit!.id,
      );
      if (index !== -1) {
        this.foundationsData[index] = {
          ...this.foundationsData[index],
          ...foundData,
        };
      }
    } else {
      const nextId =
        this.foundationsData.length > 0 ? Math.max(...this.foundationsData.map((f) => f.id)) + 1 : 1;
      const newFound: Foundation = {
        id: nextId,
        nombre: foundData.nombre,
        descripcion: foundData.descripcion,
        correo: foundData.correo,
        telefono: foundData.telefono,
        photo: foundData.photo,
        estado: STATE_ACTIVE,
        acciones: '',
      };
      this.foundationsData.push(newFound);
    }
    this.tableData = this.getFilteredData(this.filtroActual);
    this.selectedFoundationForEdit = null;
  }

  confirmarEliminar(): void {
    if (this.fundacionSeleccionadaParaBorrar) {
      const index = this.foundationsData.findIndex(
        (f) => f.id === this.fundacionSeleccionadaParaBorrar!.id,
      );
      if (index !== -1) {
        this.foundationsData[index].estado = STATE_DELETED;
      }
      this.tableData = this.getFilteredData(this.filtroActual);
      this.fundacionSeleccionadaParaBorrar = null;
    }
  }

  private getFilteredData(filterId: string): Foundation[] {
    let filtered = this.foundationsData;
    if (filterId === FOUNDATION_FILTER_ALL) {
      filtered = this.foundationsData.filter((f) => f.estado !== STATE_DELETED);
    } else if (filterId === FOUNDATION_FILTER_INACTIVE) {
      filtered = this.foundationsData.filter((f) => f.estado === STATE_INACTIVE);
    } else if (filterId === FOUNDATION_FILTER_DELETE) {
      filtered = this.foundationsData.filter((f) => f.estado === STATE_DELETED);
    }
    return filtered.map((foundation) => ({ ...foundation }));
  }
}
