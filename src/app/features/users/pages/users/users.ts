import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Filter } from '../../../../shared/components/filter/filter';
import { Tables } from '../../../../shared/components/tables/tables';
import { DeleteModal } from '../../../../shared/components/delete-modal/delete-modal';
import { EditUserModal } from '../../components/edit-user-modal/edit-user-modal';
import {
  ConfirmChangesModal,
  ModelChange,
} from '../../../../shared/components/confirm-changes-modal/confirm-changes-modal';
import {
  USERS_PRINCIPAL_HEADER,
  USERS_COLUMNS,
  USERS_FILTERS,
  USER_ROW_ACTIONS,
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
import { UserService } from '../../../../core/services/api/user.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, Filter, Tables, DeleteModal, EditUserModal, ConfirmChangesModal],
  templateUrl: './users.html',
})
export class Users implements OnInit {
  private readonly userService = inject(UserService);
  private readonly cdr = inject(ChangeDetectorRef);

  principalHeader = USERS_PRINCIPAL_HEADER;
  usersColumns = USERS_COLUMNS;
  misFiltrosUsuarios = USERS_FILTERS;
  userRowActions = USER_ROW_ACTIONS;

  usersData: User[] = [];
  tableData: User[] = [];
  loading: boolean = false;
  filtroActual: string = USER_FILTER_ALL;
  userSeleccionadoParaBorrar: User | null = null;
  selectedUserForEdit: User | null = null;
  isReadOnlyView = false;

  showConfirmModal = false;
  changesToConfirm: ModelChange[] = [];
  pendingRowToToggle: User | null = null;

  private readonly BTN_DELETE_USER_ID = 'btn-abrir-modal-delete-user';
  private readonly BTN_EDIT_USER_ID = 'btn-abrir-modal-edit-user';

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.cdr.detectChanges();
    this.userService.getAll().subscribe({
      next: (res) => {
        this.usersData = res.data.map((u: any) => {
          let statusMapped = 'ACTIVO';
          const s = String(u.status || '').toUpperCase();
          if (s === 'ACTIVE' || s === 'ACTIVO') {
            statusMapped = 'ACTIVO';
          } else if (s === 'INACTIVE' || s === 'INACTIVO') {
            statusMapped = 'INACTIVO';
          } else if (s === 'DELETED' || s === 'ELIMINADO') {
            statusMapped = 'ELIMINADO';
          }

          return {
            ...u,
            name: u.name || u.username || 'Sin Nombre',
            status: statusMapped,
            role: Array.isArray(u.role)
              ? u.role.map((r: string) => r.toUpperCase()).join(', ')
              : (u.role || 'USUARIO').toUpperCase(),
          };
        });
        this.tableData = this.getFilteredData(this.filtroActual);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filtrarPorEstado(estadoId: string) {
    this.filtroActual = estadoId;
    this.tableData = this.getFilteredData(estadoId);
    this.cdr.detectChanges();
  }

  manejarAccion(evento: { actionId: number; row: User }) {
    try {
      const actions: Record<number, () => void> = {
        [USER_ACTION_EDIT]: () => {
          this.selectedUserForEdit = evento.row;
          this.isReadOnlyView = evento.row.status === STATE_DELETED;
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
      this.userService.deleteUser(targetUser._id, razon).subscribe({
        next: () => {
          this.loadUsers();
          this.userSeleccionadoParaBorrar = null;
        },
      });
    } catch {}
  }

  confirmarCambioEstado() {
    if (this.pendingRowToToggle && this.changesToConfirm.length > 0) {
      const targetUser = this.pendingRowToToggle;
      const nextStatus = this.changesToConfirm[0].nuevo as 'ACTIVO' | 'INACTIVO';
      this.userService.update(targetUser._id, { status: nextStatus }).subscribe({
        next: () => {
          this.loadUsers();
          this.cancelarCambioEstado();
        },
      });
    }
  }

  cancelarCambioEstado() {
    this.showConfirmModal = false;
    this.changesToConfirm = [];
    this.pendingRowToToggle = null;
  }

  onSaveUser(userData: User) {
    if (userData._id) {
      this.userService.update(userData._id, userData).subscribe({
        next: () => {
          this.loadUsers();
        },
      });
    } else {
      this.userService.create(userData).subscribe({
        next: () => {
          this.loadUsers();
        },
      });
    }
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
