import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Filter } from '../../../../shared/components/filter/filter';
import { Tables } from '../../../../shared/components/tables/tables';
import { DeleteModal } from '../../../../shared/components/delete-modal/delete-modal';
import { MainButton } from '../../../../shared/components/main-button/main-button';
import { CreateFoundationModal } from '../../components/create-foundation-modal/create-foundation-modal';
import { ConfirmChangesModal, ModelChange } from '../../../../shared/components/confirm-changes-modal/confirm-changes-modal';
import {
  FOUNDATION_FILTERS,
  FOUNDATION_FILTER_ALL,
  FOUNDATION_FILTER_INACTIVE,
  FOUNDATION_FILTER_DELETE,
  FOUNDATION_ROW_ACTIONS,
  MY_FOUNDATIONS_COLUMNS,
  MY_FOUNDATIONS_DATA_MOCK,
  MY_FOUNDATIONS_PRINCIPAL_HEADER,
  STATE_ACTIVE,
  STATE_INACTIVE,
  STATE_DELETED,
} from '../../../../core/helpers/global/foundation.constants';
import { Foundation } from '../../../../core/interfaces/api/foundation.interface';
import {
  TABLE_ACTION_CHANGE_STATE,
  TABLE_ACTION_DELETE,
  TABLE_ACTION_EDIT_DETAIL,
} from '../../../../core/helpers/ui/constants';
import { generateObjectId } from '../../../../core/helpers/ui/utils';

@Component({
  selector: 'app-foundations',
  standalone: true,
  imports: [CommonModule, Filter, Tables, DeleteModal, MainButton, CreateFoundationModal, ConfirmChangesModal],
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
  isReadOnlyView = false;

  showConfirmModal = false;
  changesToConfirm: ModelChange[] = [];
  pendingRowToToggle: Foundation | null = null;

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
    this.isReadOnlyView = false;
    document.getElementById(this.BTN_CREATE_FOUNDATION_ID)?.click();
  }

  manejarAccion(evento: { actionId: number; row: Record<string, unknown> }): void {
    const row = evento.row as unknown as Foundation;
    try {
      const actions: Record<number, () => void> = {
        [TABLE_ACTION_CHANGE_STATE]: () => {
          try {
            const index = this.foundationsData.findIndex((f) => f._id === row._id);
            if (index === -1) throw new Error();
            const current = this.foundationsData[index].status;
            const currentUpper = current.toUpperCase();

            let nextState = STATE_ACTIVE;
            try {
              if (currentUpper.includes('ACTIV') && !currentUpper.includes('DESACTIV')) throw new Error();
            } catch {
              nextState = STATE_INACTIVE;
            }

            this.pendingRowToToggle = row;
            this.changesToConfirm = [
              {
                campo: 'Estado de la Fundación',
                anterior: current,
                nuevo: nextState,
              },
            ];
            this.showConfirmModal = true;
          } catch {}
        },
        [TABLE_ACTION_DELETE]: () => {
          this.fundacionSeleccionadaParaBorrar = row;
          document.getElementById(this.BTN_DELETE_FOUNDATION_ID)?.click();
        },
        [TABLE_ACTION_EDIT_DETAIL]: () => {
          this.selectedFoundationForEdit = row;
          this.isReadOnlyView = row.status === STATE_DELETED;
          document.getElementById(this.BTN_CREATE_FOUNDATION_ID)?.click();
        },
      };

      const action = actions[evento.actionId];
      if (!action) throw new Error();
      action();
    } catch {}
  }

  onSaveFoundation(foundData: Foundation): void {
    try {
      const editFoundation = this.selectedFoundationForEdit;
      if (!editFoundation) throw new Error('Create foundation flow');
      const index = this.foundationsData.findIndex((f) => f._id === editFoundation._id);
      if (index === -1) throw new Error();
      this.foundationsData[index] = {
        ...this.foundationsData[index],
        ...foundData,
      };
    } catch {
      try {
        const newFound: Foundation = {
          _id: generateObjectId(),
          name: foundData.name,
          description: foundData.description,
          email: foundData.email,
          phone: foundData.phone,
          photo: foundData.photo,
          status: STATE_ACTIVE,
          actions: '',
        };
        this.foundationsData.push(newFound);
      } catch {}
    }
    this.tableData = this.getFilteredData(this.filtroActual);
    this.selectedFoundationForEdit = null;
  }

  confirmarEliminar(razon: string): void {
    try {
      const targetFound = this.fundacionSeleccionadaParaBorrar;
      if (!targetFound) throw new Error();
      const index = this.foundationsData.findIndex((f) => f._id === targetFound._id);
      if (index === -1) throw new Error();
      this.foundationsData[index].status = STATE_DELETED;
      this.foundationsData[index].deleteReason = razon;
      this.tableData = this.getFilteredData(this.filtroActual);
      this.fundacionSeleccionadaParaBorrar = null;
    } catch {}
  }

  confirmarCambioEstado(): void {
    if (this.pendingRowToToggle && this.changesToConfirm.length > 0) {
      const index = this.foundationsData.findIndex((f) => f._id === this.pendingRowToToggle!._id);
      if (index !== -1) {
        this.foundationsData[index].status = this.changesToConfirm[0].nuevo as 'ACTIVO' | 'INACTIVO' | 'ELIMINADO';
        this.tableData = this.getFilteredData(this.filtroActual);
      }
    }
    this.cancelarCambioEstado();
  }

  cancelarCambioEstado(): void {
    this.showConfirmModal = false;
    this.changesToConfirm = [];
    this.pendingRowToToggle = null;
  }

  private getFilteredData(filterId: string): Foundation[] {
    let filtered = this.foundationsData;
    try {
      const filterActions: Record<string, () => Foundation[]> = {
        [FOUNDATION_FILTER_ALL]: () => this.foundationsData.filter((f) => f.status !== STATE_DELETED),
        [FOUNDATION_FILTER_INACTIVE]: () => this.foundationsData.filter((f) => f.status === STATE_INACTIVE),
        [FOUNDATION_FILTER_DELETE]: () => this.foundationsData.filter((f) => f.status === STATE_DELETED),
      };

      const filterFn = filterActions[filterId];
      if (!filterFn) throw new Error();
      filtered = filterFn();
    } catch {}
    return filtered.map((foundation) => ({ ...foundation }));
  }
}

