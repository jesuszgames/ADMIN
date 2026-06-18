import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
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
import { isDeletedStatus, isInactiveStatus } from '../../../../core/helpers/ui/utils';

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

  isFoundationSaving = false;
  isFoundationDeleting = false;
  isFoundationUpdatingState = false;

  private readonly BTN_DELETE_FOUNDATION_ID = 'btn-abrir-modal-delete-foundation';
  private readonly BTN_CREATE_FOUNDATION_ID = 'btn-abrir-modal-create-foundation';

  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  searchTerm = '';

  ngOnInit(): void {
    setTimeout(() => {
      this.loadFoundations();
    });
  }

  loading = false;

  getBackendStatus(filterId: string): string {
    if (filterId === FOUNDATION_FILTER_ALL) return 'ALL_ACTIVE_INACTIVE';
    if (filterId === FOUNDATION_FILTER_INACTIVE) return 'INACTIVE';
    if (filterId === FOUNDATION_FILTER_DELETE) return 'DELETED';
    return '';
  }

  loadFoundations(): void {
    this.loading = true;
    const statusParam = this.getBackendStatus(this.filtroActual);
    this.foundationService.getAll(this.currentPage, this.pageSize, this.searchTerm, statusParam).subscribe({
      next: (res) => {
        if (res) {
          this.foundationsData = res.data || [];
          this.tableData = this.foundationsData;
          this.totalCount = res.totalCount || 0;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('API Error: No se pudo cargar fundaciones del backend.', err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  filtrarPorCategoria(id: string): void {
    this.filtroActual = id;
    this.currentPage = 1;
    this.loadFoundations();
  }

  onPageChanged(page: number): void {
    this.currentPage = page;
    this.loadFoundations();
  }

  onSearchChanged(term: string): void {
    this.searchTerm = term;
    this.currentPage = 1;
    this.loadFoundations();
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
    if (this.isFoundationSaving) return;
    this.isFoundationSaving = true;

    const editFoundation = this.selectedFoundationForEdit;
    if (editFoundation) {
      this.foundationService.update(editFoundation._id, foundData).subscribe({
        next: () => {
          this.isFoundationSaving = false;
          this.loadFoundations();
          document.getElementById('btn-cerrar-modal-crear-fundacion')?.click();
        },
        error: (err) => {
          console.error('API Error: No se pudo actualizar la fundación.', err);
          this.isFoundationSaving = false;
        },
      });
    } else {
      this.foundationService.create(foundData).subscribe({
        next: () => {
          this.isFoundationSaving = false;
          this.loadFoundations();
          document.getElementById('btn-cerrar-modal-crear-fundacion')?.click();
        },
        error: (err) => {
          console.error('API Error: No se pudo crear la fundación.', err);
          this.isFoundationSaving = false;
        },
      });
    }
  }

  confirmarEliminar(razon: string): void {
    const targetFound = this.fundacionSeleccionadaParaBorrar;
    if (!targetFound || this.isFoundationDeleting) return;
    this.isFoundationDeleting = true;

    this.foundationService.deleteFoundation(targetFound._id, razon).subscribe({
      next: () => {
        this.loadFoundations();
        this.isFoundationDeleting = false;
      },
      error: (err) => {
        console.error('API Error: No se pudo eliminar la fundación del backend.', err);
        this.isFoundationDeleting = false;
      },
    });
    this.fundacionSeleccionadaParaBorrar = null;
  }

  confirmarCambioEstado(): void {
    if (this.pendingRowToToggle && this.changesToConfirm.length > 0 && !this.isFoundationUpdatingState) {
      const nextStatus = this.changesToConfirm[0].nuevo as 'ACTIVE' | 'INACTIVE' | 'DELETED';
      this.isFoundationUpdatingState = true;
      this.foundationService.update(this.pendingRowToToggle._id, { status: nextStatus }).subscribe({
        next: () => {
          this.loadFoundations();
          this.isFoundationUpdatingState = false;
        },
        error: (err) => {
          console.error('API Error: No se pudo actualizar el estado de la fundación.', err);
          this.isFoundationUpdatingState = false;
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
}



