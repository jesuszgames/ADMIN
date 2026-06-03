import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Filter } from '../../../../shared/components/filter/filter';
import { Tables } from '../../../../shared/components/tables/tables';
import { DeleteModal } from '../../../../shared/components/delete-modal/delete-modal';
import { MainButton } from '../../../../shared/components/main-button/main-button';
import { CreateFoundationModal } from '../../components/create-foundation-modal/create-foundation-modal';
import { ConfirmChangesModal } from '../../../../shared/components/confirm-changes-modal/confirm-changes-modal';
import { ModelChange } from '../../../../core/interfaces/api/model-change.interface';
import {
  FOUNDATION_FILTERS,
  FOUNDATION_FILTER_ALL,
  FOUNDATION_FILTER_INACTIVE,
  FOUNDATION_FILTER_DELETE,
  FOUNDATION_ROW_ACTIONS,
  MY_FOUNDATIONS_COLUMNS,
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
import { FoundationService } from '../../../../core/services/api/foundation.service';

@Component({
  selector: 'app-foundations',
  standalone: true,
  imports: [CommonModule, Filter, Tables, DeleteModal, MainButton, CreateFoundationModal, ConfirmChangesModal],
  templateUrl: './foundations.html',
})
export class Foundations implements OnInit {
  private readonly foundationService = inject(FoundationService);
  private readonly cdr = inject(ChangeDetectorRef);

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

  ngOnInit(): void {
    this.loadFoundations();
  }

  loadFoundations(): void {
    this.foundationService.getAll().subscribe({
      next: (res) => {
        if (res && res.data) {
          this.foundationsData = res.data;
          this.tableData = this.getFilteredData(this.filtroActual);
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('API Error: No se pudo cargar fundaciones del backend.', err);
      },
    });
  }

  filtrarPorCategoria(id: string): void {
    this.filtroActual = id;
    this.tableData = this.getFilteredData(id);
  }

  foundationsData: Foundation[] = [];
  tableData: Foundation[] = [];

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
            const nextState = current === STATE_ACTIVE ? STATE_INACTIVE : STATE_ACTIVE;

            this.pendingRowToToggle = row;
            this.changesToConfirm = [
              {
                campo: 'Estado de la Fundación',
                anterior: current,
                nuevo: nextState,
              },
            ];
            this.showConfirmModal = true;
          } catch { }
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
    } catch { }
  }

  onSaveFoundation(foundData: Foundation): void {
    const editFoundation = this.selectedFoundationForEdit;
    if (editFoundation) {
      this.foundationService.update(editFoundation._id, foundData).subscribe({
        next: () => {
          this.loadFoundations();
        },
        error: (err) => {
          console.error('API Error: No se pudo actualizar la fundación.', err);
        },
      });
    } else {
      this.foundationService.create(foundData).subscribe({
        next: () => {
          this.loadFoundations();
        },
        error: (err) => {
          console.error('API Error: No se pudo crear la fundación.', err);
        },
      });
    }
    this.selectedFoundationForEdit = null;
  }

  confirmarEliminar(razon: string): void {
    const targetFound = this.fundacionSeleccionadaParaBorrar;
    if (!targetFound) return;

    this.foundationService.deleteFoundation(targetFound._id, razon).subscribe({
      next: () => {
        this.loadFoundations();
      },
      error: (err) => {
        console.error('API Error: No se pudo eliminar la fundación del backend.', err);
      },
    });
    this.fundacionSeleccionadaParaBorrar = null;
  }

  confirmarCambioEstado(): void {
    if (this.pendingRowToToggle && this.changesToConfirm.length > 0) {
      const nextStatus = this.changesToConfirm[0].nuevo as 'ACTIVE' | 'INACTIVE' | 'DELETED';
      this.foundationService.update(this.pendingRowToToggle._id, { status: nextStatus }).subscribe({
        next: () => {
          this.loadFoundations();
        },
        error: (err) => {
          console.error('API Error: No se pudo actualizar el estado de la fundación.', err);
        },
      });
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
    } catch { }
    return filtered.map((foundation) => ({ ...foundation }));
  }
}

