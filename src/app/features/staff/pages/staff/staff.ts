import { Component, inject, OnInit, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import { Tables } from '../../../../shared/components/tables/tables';
import { DeleteModal } from '../../../../shared/components/delete-modal/delete-modal';
import { EditUserModal } from '../../../../shared/components/edit-user-modal/edit-user-modal';
import { ConfirmChangesModal } from '../../../../shared/components/confirm-changes-modal/confirm-changes-modal';
import { MainButton } from '../../../../shared/components/main-button/main-button';
import { ModelChange } from '../../../../core/interfaces/api/model-change.interface';
import {
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
  USERS_PRINCIPAL_HEADER,
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
} from '../../../../core/helpers/global/auth.constants';
import { User } from '../../../../core/interfaces/api/user.interface';
import { UserService } from '../../../../core/services/api/user.service';
import {
  STATUS_FILTER_OPTIONS,
  statusFilterToBackend,
  StatusFilterOption,
} from '../../../../core/helpers/global/status-filter.constants';

const DEFAULT_USER_NAME_LABEL = 'Sin Nombre';

@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectComponent, Tables, DeleteModal, EditUserModal, ConfirmChangesModal, MainButton],
  templateUrl: './staff.html',
})
export class StaffComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  principalHeader = USERS_PRINCIPAL_HEADER;
  columns = USERS_COLUMNS;
  rowActions = USER_ROW_ACTIONS;

  usersData: User[] = [];
  tableData: User[] = [];
  loading: boolean = false;
  isUserSaving = false;
  isUserDeleting = false;
  isUserUpdatingState = false;

  selectedRole = '';
  selectedStatus = 'all';
  tempRole = '';
  tempStatus = 'all';

  roleOptions = [
    { id: '', label: 'Todos' },
    { id: 'admin', label: 'Administrador' },
    { id: 'sort', label: 'Sorteador' },
  ];

  statusOptions = STATUS_FILTER_OPTIONS as StatusFilterOption[];

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

  showDeleteModal = false;
  showEditUserModal = false;

  private readonly BTN_DELETE_USER_ID = 'btn-abrir-modal-delete-user';
  private readonly BTN_EDIT_USER_ID = 'btn-abrir-modal-edit-user';

  ngOnInit(): void {
    setTimeout(() => {
      this.loadUsers();
    });
  }

  loadUsers(): void {
    this.loading = true;
    this.cdr.detectChanges();

    const backendStatus = statusFilterToBackend(this.selectedStatus);
    const roleParam = this.selectedRole || 'admin,sort';

    this.userService.getAll(this.currentPage, this.pageSize, this.searchText, backendStatus, roleParam)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (res) => {
        if (!res || !res.data) {
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
          const statusUpper = String(u.status || '').toUpperCase();
          if (statusUpper === BACKEND_STATUS_ACTIVE || statusUpper === USER_STATUS_ACTIVE) {
            statusMapped = USER_STATUS_ACTIVE;
          } else if (statusUpper === BACKEND_STATUS_INACTIVE || statusUpper === USER_STATUS_INACTIVE) {
            statusMapped = USER_STATUS_INACTIVE;
          } else if (statusUpper === BACKEND_STATUS_DELETED || statusUpper === STATE_DELETED) {
            statusMapped = STATE_DELETED;
          }

          const formatDate = (dateVal: Date | string | number | null | undefined) => {
            if (!dateVal) return '';
            try {
              const dateObj = new Date(dateVal);
              if (isNaN(dateObj.getTime())) return String(dateVal);
              const day = String(dateObj.getDate()).padStart(2, '0');
              const month = String(dateObj.getMonth() + 1).padStart(2, '0');
              const year = dateObj.getFullYear();
              const hours = String(dateObj.getHours()).padStart(2, '0');
              const minutes = String(dateObj.getMinutes()).padStart(2, '0');
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

  clearFilters() {
    this.tempRole = '';
    this.tempStatus = 'all';
    this.applyFilters();
  }

  applyFilters() {
    this.selectedRole = this.tempRole;
    this.selectedStatus = this.tempStatus;
    this.currentPage = 1;
    this.loadUsers();
  }

  onPageChanged(page: number): void {
    this.currentPage = page;
    this.loadUsers();
  }

  onSearchChanged(search: string): void {
    this.searchText = search;
    this.currentPage = 1;
    this.loadUsers();
  }

  onCloseDeleteModal(): void {
    this.showDeleteModal = false;
    this.userSeleccionadoParaBorrar = null;
  }

  onCloseEditUserModal(): void {
    this.showEditUserModal = false;
    this.selectedUserForEdit = null;
  }

  manejarAccion(evento: { actionId: number; row: User }) {
    try {
      const actions: Record<number, () => void> = {
        [USER_ACTION_EDIT]: () => {
          this.selectedUserForEdit = evento.row;
          this.isReadOnlyView = evento.row.status === STATE_DELETED;
          this.showEditUserModal = true;
          this.cdr.detectChanges();
          document.getElementById(this.BTN_EDIT_USER_ID)?.click();
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
          this.showDeleteModal = true;
          this.cdr.detectChanges();
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
    this.showEditUserModal = true;
    this.cdr.detectChanges();
    document.getElementById(this.BTN_EDIT_USER_ID)?.click();
  }

  confirmarEliminar(razon: string) {
    try {
      const targetUser = this.userSeleccionadoParaBorrar;
      if (!targetUser || this.isUserDeleting) throw new Error();
      this.isUserDeleting = true;
      this.userService.deleteUser(targetUser._id, razon)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
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
      this.userService.update(targetUser._id, { status: nextStatus })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
        next: () => {
          this.cancelarCambioEstado();
          this.loadUsers();
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
      this.userService.update(userData._id, userData)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
        next: () => {
          this.isUserSaving = false;
          this.loadUsers();
          document.getElementById('btn-cerrar-modal-editar-usuario')?.click();
        },
        error: (err) => {
          console.error('Error al guardar cambios de usuario:', err);
          this.isUserSaving = false;
        },
      });
    } else {
      this.userService.create(userData)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
        next: () => {
          this.isUserSaving = false;
          this.loadUsers();
          document.getElementById('btn-cerrar-modal-editar-usuario')?.click();
        },
        error: (err) => {
          console.error('Error al crear usuario:', err);
          this.isUserSaving = false;
        },
      });
    }
  }
}
