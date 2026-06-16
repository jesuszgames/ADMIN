import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Filter } from '../../../../shared/components/filter/filter';
import { Tables } from '../../../../shared/components/tables/tables';
import { DeleteModal } from '../../../../shared/components/delete-modal/delete-modal';
import { EditUserModal } from '../../components/edit-user-modal/edit-user-modal';
import { ConfirmChangesModal } from '../../../../shared/components/confirm-changes-modal/confirm-changes-modal';
import { MainButton } from '../../../../shared/components/main-button/main-button';
import { ModelChange } from '../../../../core/interfaces/api/model-change.interface';
import {
  USERS_PRINCIPAL_HEADER,
  USERS_COLUMNS,
  PLAYERS_COLUMNS,
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
import {
  ROLE_ADMIN,
  ROLE_SORTEADOR,
  ROLE_USUARIO,
  BACKEND_STATUS_ACTIVE,
  BACKEND_STATUS_INACTIVE,
  BACKEND_STATUS_DELETED,
  BACKEND_ROLE_ADMIN,
  BACKEND_ROLE_SORT,
  BACKEND_ROLE_PLAYER,
} from '../../../../core/helpers/global/auth.constants';
import { User } from '../../../../core/interfaces/api/user.interface';
import { UserService } from '../../../../core/services/api/user.service';

const DEFAULT_USER_NAME_LABEL = 'Sin Nombre';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, Filter, Tables, DeleteModal, EditUserModal, ConfirmChangesModal, MainButton],
  templateUrl: './users.html',
})
export class Users implements OnInit {
  private readonly userService = inject(UserService);
  private readonly cdr = inject(ChangeDetectorRef);

  principalHeader = USERS_PRINCIPAL_HEADER;
  usersColumns = USERS_COLUMNS;
  misFiltrosUsuarios = USERS_FILTERS;
  userRowActions = USER_ROW_ACTIONS;

  activeTab: 'staff' | 'player' = 'staff';

  usersData: User[] = [];
  tableData: User[] = [];
  loading: boolean = false;
  isUserSaving = false;
  isUserDeleting = false;
  isUserUpdatingState = false;
  filtroActual: string = USER_FILTER_ALL;
  userSeleccionadoParaBorrar: User | null = null;
  selectedUserForEdit: User | null = null;
  isReadOnlyView = false;

  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  searchText = '';

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

    let backendStatus: string | undefined = undefined;
    if (this.filtroActual === USER_FILTER_INACTIVE) {
      backendStatus = 'INACTIVE';
    } else if (this.filtroActual === USER_FILTER_DELETE) {
      backendStatus = 'DELETED';
    } else {
      backendStatus = 'ACTIVE,INACTIVE';
    }

    const queryRole = this.activeTab === 'staff' ? 'admin,sort' : 'player';
    this.usersColumns = this.activeTab === 'staff' ? USERS_COLUMNS : PLAYERS_COLUMNS;
    this.principalHeader = this.activeTab === 'staff' ? 'Lista Staff / Administradores' : 'Lista Jugadores / Compradores';
    this.userRowActions = this.activeTab === 'staff'
      ? USER_ROW_ACTIONS
      : USER_ROW_ACTIONS.filter(action => action.id === USER_ACTION_TOGGLE_STATUS);

    this.userService.getAll(this.currentPage, this.pageSize, this.searchText, backendStatus, queryRole).subscribe({
      next: (res) => {
        if (!res || !res.data) {
          console.warn('UserService.getAll returned empty or invalid data');
          this.usersData = [];
          this.tableData = [];
          this.totalItems = 0;
          this.loading = false;
          this.cdr.detectChanges();
          return;
        }

        this.totalItems = res.totalCount || 0;
        this.usersData = res.data.map((u: User) => {
          let statusMapped: typeof USER_STATUS_ACTIVE | typeof USER_STATUS_INACTIVE | typeof STATE_DELETED = USER_STATUS_ACTIVE;
          const s = String(u.status || '').toUpperCase();
          if (s === BACKEND_STATUS_ACTIVE || s === USER_STATUS_ACTIVE) {
            statusMapped = USER_STATUS_ACTIVE;
          } else if (s === BACKEND_STATUS_INACTIVE || s === USER_STATUS_INACTIVE) {
            statusMapped = USER_STATUS_INACTIVE;
          } else if (s === BACKEND_STATUS_DELETED || s === STATE_DELETED) {
            statusMapped = STATE_DELETED;
          }

          const formatDate = (dateVal: any) => {
            if (!dateVal) return '';
            try {
              const d = new Date(dateVal);
              if (isNaN(d.getTime())) return String(dateVal);
              const day = String(d.getDate()).padStart(2, '0');
              const month = String(d.getMonth() + 1).padStart(2, '0');
              const year = d.getFullYear();
              const hours = String(d.getHours()).padStart(2, '0');
              const minutes = String(d.getMinutes()).padStart(2, '0');
              return `${day}/${month}/${year} ${hours}:${minutes}`;
            } catch {
              return String(dateVal);
            }
          };

          let roleText = ROLE_USUARIO;
          if (u.role && u.role.includes(BACKEND_ROLE_ADMIN)) {
            roleText = ROLE_ADMIN;
          } else if (u.role && u.role.includes(BACKEND_ROLE_SORT)) {
            roleText = ROLE_SORTEADOR;
          } else if (u.role && u.role.includes(BACKEND_ROLE_PLAYER)) {
            roleText = ROLE_USUARIO;
          }

          return {
            ...u,
            name: u.name || DEFAULT_USER_NAME_LABEL,
            username: u.username || '',
            roleText: roleText,
            status: statusMapped,
            balance: u['balance'] !== undefined ? `$${Number(u['balance'] || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00',
            createdAtText: formatDate(u.createdAt),
            updatedAtText: formatDate(u.updatedAt),
          } as User;
        });

        this.tableData = this.usersData;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('UserService.getAll failed with error:', err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  filtrarPorEstado(estadoId: string) {
    this.filtroActual = estadoId;
    this.currentPage = 1;
    this.loadUsers();
  }

  cambiarTab(tab: 'staff' | 'player'): void {
    this.activeTab = tab;
    this.currentPage = 1;
    this.searchText = '';
    this.loadUsers();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadUsers();
  }

  onSearchChange(search: string): void {
    this.searchText = search;
    this.currentPage = 1;
    this.loadUsers();
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

            let nextState: typeof USER_STATUS_ACTIVE | typeof USER_STATUS_INACTIVE = USER_STATUS_ACTIVE;
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
          } catch { }
        },
        [USER_ACTION_DELETE]: () => {
          this.userSeleccionadoParaBorrar = evento.row;
          document.getElementById(this.BTN_DELETE_USER_ID)?.click();
        },
      };

      const action = actions[evento.actionId];
      if (!action) throw new Error();
      action();
    } catch { }
  }

  abrirCrearStaff(): void {
    this.selectedUserForEdit = null;
    this.isReadOnlyView = false;
    document.getElementById(this.BTN_EDIT_USER_ID)?.click();
  }

  confirmarEliminar(razon: string) {
    try {
      const targetUser = this.userSeleccionadoParaBorrar;
      if (!targetUser || this.isUserDeleting) throw new Error();
      this.isUserDeleting = true;
      this.userService.deleteUser(targetUser._id, razon).subscribe({
        next: () => {
          this.loadUsers();
          this.userSeleccionadoParaBorrar = null;
          this.isUserDeleting = false;
        },
        error: (err) => {
          console.error('Error al borrar usuario:', err);
          this.isUserDeleting = false;
        }
      });
    } catch { }
  }

  confirmarCambioEstado() {
    if (this.pendingRowToToggle && this.changesToConfirm.length > 0 && !this.isUserUpdatingState) {
      const targetUser = this.pendingRowToToggle;
      const nextStatus = this.changesToConfirm[0].nuevo as typeof USER_STATUS_ACTIVE | typeof USER_STATUS_INACTIVE;
      this.isUserUpdatingState = true;
      this.userService.update(targetUser._id, { status: nextStatus }).subscribe({
        next: () => {
          this.loadUsers();
          this.cancelarCambioEstado();
          this.isUserUpdatingState = false;
        },
        error: (err) => {
          console.error('Error al cambiar estado de usuario:', err);
          this.isUserUpdatingState = false;
        }
      });
    }
  }

  cancelarCambioEstado() {
    this.showConfirmModal = false;
    this.changesToConfirm = [];
    this.pendingRowToToggle = null;
  }

  onSaveUser(userData: User) {
    if (this.isUserSaving) return;
    this.isUserSaving = true;

    if (userData._id) {
      this.userService.update(userData._id, userData).subscribe({
        next: () => {
          this.loadUsers();
          this.isUserSaving = false;
          document.getElementById('btn-cerrar-modal-editar-usuario')?.click();
          this.selectedUserForEdit = null;
        },
        error: (err) => {
          console.error('Error al guardar cambios de usuario:', err);
          this.isUserSaving = false;
        },
      });
    } else {
      this.userService.create(userData).subscribe({
        next: () => {
          this.loadUsers();
          this.isUserSaving = false;
          document.getElementById('btn-cerrar-modal-editar-usuario')?.click();
          this.selectedUserForEdit = null;
        },
        error: (err) => {
          console.error('Error al crear usuario:', err);
          this.isUserSaving = false;
        },
      });
    }
  }
}
