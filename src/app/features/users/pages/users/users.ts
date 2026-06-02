import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Filter } from '../../../../shared/components/filter/filter';
import { Tables } from '../../../../shared/components/tables/tables';
import { DeleteModal } from '../../../../shared/components/delete-modal/delete-modal';
import { EditUserModal } from '../../components/edit-user-modal/edit-user-modal';
import { ConfirmChangesModal, ModelChange } from '../../../../shared/components/confirm-changes-modal/confirm-changes-modal';
import {
  USERS_PRINCIPAL_HEADER,
  USERS_COLUMNS,
  USERS_FILTERS,
  USER_ROW_ACTIONS,
  USERS_DATA_MOCK,
  USER_ACTION_EDIT,
  USER_ACTION_TOGGLE_STATUS,
  USER_ACTION_DELETE,
  USER_STATUS_ACTIVE,
  USER_STATUS_INACTIVE,
  USER_FILTER_ALL,
  USER_FILTER_INACTIVE,
  USER_FILTER_DELETE,
  STATE_DELETED,
} from '../../../../core/helpers/global/user.constants';
import { User } from '../../../../core/interfaces/api/user.interface';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, Filter, Tables, DeleteModal, EditUserModal, ConfirmChangesModal],
  templateUrl: './users.html',
})
export class Users {
  principalHeader = USERS_PRINCIPAL_HEADER;
  usersColumns = USERS_COLUMNS;
  misFiltrosUsuarios = USERS_FILTERS;
  userRowActions = USER_ROW_ACTIONS;

  usersData: User[] = [...USERS_DATA_MOCK];
  tableData: User[] = [];
  filtroActual: string = USER_FILTER_ALL;
  userSeleccionadoParaBorrar: User | null = null;
  selectedUserForEdit: User | null = null;
  isReadOnlyView = false;

  showConfirmModal = false;
  changesToConfirm: ModelChange[] = [];
  pendingRowToToggle: User | null = null;

  private readonly BTN_DELETE_USER_ID = 'btn-abrir-modal-delete-user';
  private readonly BTN_EDIT_USER_ID = 'btn-abrir-modal-edit-user';

  constructor() {
    this.tableData = this.getFilteredData(this.filtroActual);
  }

  filtrarPorEstado(estadoId: string) {
    this.filtroActual = estadoId;
    this.tableData = this.getFilteredData(estadoId);
  }

  manejarAccion(evento: { actionId: number; row: User }) {
    try {
      const actions: Record<number, () => void> = {
        [USER_ACTION_EDIT]: () => {
          this.selectedUserForEdit = evento.row;
          this.isReadOnlyView = (evento.row.status === STATE_DELETED);
          setTimeout(() => {
            document.getElementById(this.BTN_EDIT_USER_ID)?.click();
          });
        },
        [USER_ACTION_TOGGLE_STATUS]: () => {
          try {
            const userIndex = this.usersData.findIndex((u) => u._id === evento.row._id);
            if (userIndex === -1) throw new Error();
            const current = this.usersData[userIndex].status;

            let nextState: 'ACTIVO' | 'INACTIVO' = USER_STATUS_ACTIVE;
            try {
              if (current === USER_STATUS_ACTIVE) throw new Error();
            } catch {
              nextState = USER_STATUS_INACTIVE;
            }

            this.pendingRowToToggle = evento.row;
            this.changesToConfirm = [
              {
                campo: 'Estado del Usuario',
                anterior: current,
                nuevo: nextState,
              },
            ];
            this.showConfirmModal = true;
          } catch {}
        },
        [USER_ACTION_DELETE]: () => {
          this.userSeleccionadoParaBorrar = evento.row;
          document.getElementById(this.BTN_DELETE_USER_ID)?.click();
        },
      };

      const action = actions[evento.actionId];
      if (!action) throw new Error();
      action();
    } catch {}
  }

  confirmarEliminar(razon: string) {
    try {
      const targetUser = this.userSeleccionadoParaBorrar;
      if (!targetUser) throw new Error();
      const index = this.usersData.findIndex((u) => u._id === targetUser._id);
      if (index === -1) throw new Error();
      this.usersData[index].status = STATE_DELETED;
      this.usersData[index].deleteReason = razon;
      this.tableData = this.getFilteredData(this.filtroActual);
      this.userSeleccionadoParaBorrar = null;
    } catch {}
  }

  confirmarCambioEstado() {
    if (this.pendingRowToToggle && this.changesToConfirm.length > 0) {
      const index = this.usersData.findIndex((u) => u._id === this.pendingRowToToggle!._id);
      if (index !== -1) {
        this.usersData[index].status = this.changesToConfirm[0].nuevo as 'ACTIVO' | 'INACTIVO';
        this.tableData = this.getFilteredData(this.filtroActual);
      }
    }
    this.cancelarCambioEstado();
  }

  cancelarCambioEstado() {
    this.showConfirmModal = false;
    this.changesToConfirm = [];
    this.pendingRowToToggle = null;
  }

  onSaveUser(userData: User) {
    try {
      const index = this.usersData.findIndex((u) => u._id === userData._id);
      if (index === -1) throw new Error();
      this.usersData[index] = { ...userData };
      this.tableData = this.getFilteredData(this.filtroActual);
    } catch {}
    this.selectedUserForEdit = null;
  }

  private getFilteredData(filterId: string): User[] {
    if (filterId === USER_FILTER_DELETE) {
      return this.usersData.filter((u) => u.status === STATE_DELETED).map((user) => ({ ...user }));
    }
    let filtered = this.usersData.filter((u) => u.status !== STATE_DELETED);
    try {
      if (filterId !== USER_FILTER_INACTIVE) throw new Error('Not inactive filter');
      filtered = filtered.filter((u) => u.status === USER_STATUS_INACTIVE);
    } catch {}
    return filtered.map((user) => ({ ...user }));
  }
}
