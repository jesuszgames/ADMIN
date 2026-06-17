import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Filter } from '../../../../shared/components/filter/filter';
import { Tables } from '../../../../shared/components/tables/tables';
import { ConfirmChangesModal } from '../../../../shared/components/confirm-changes-modal/confirm-changes-modal';
import { ModelChange } from '../../../../core/interfaces/api/model-change.interface';
import {
  PLAYERS_COLUMNS,
  USERS_FILTERS,
  USER_ROW_ACTIONS,
  USER_ACTION_TOGGLE_STATUS,
  USER_STATUS_ACTIVE,
  USER_STATUS_INACTIVE,
  USER_FILTER_ALL,
  USER_FILTER_INACTIVE,
  USER_FILTER_DELETE,
  STATE_DELETED,
} from '../../../../core/helpers/global/user.constants';
import {
  ROLE_USUARIO,
  BACKEND_STATUS_ACTIVE,
  BACKEND_STATUS_INACTIVE,
  BACKEND_STATUS_DELETED,
  BACKEND_ROLE_PLAYER,
} from '../../../../core/helpers/global/auth.constants';
import { User } from '../../../../core/interfaces/api/user.interface';
import { UserService } from '../../../../core/services/api/user.service';

const DEFAULT_USER_NAME_LABEL = 'Sin Nombre';

@Component({
  selector: 'app-players',
  standalone: true,
  imports: [CommonModule, Filter, Tables, ConfirmChangesModal],
  templateUrl: './players.html',
})
export class PlayersComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly cdr = inject(ChangeDetectorRef);

  columns = PLAYERS_COLUMNS;
  filters = USERS_FILTERS;
  // Players only get to change status, not edit or delete
  rowActions = USER_ROW_ACTIONS.filter(action => action.id === USER_ACTION_TOGGLE_STATUS);

  usersData: User[] = [];
  tableData: User[] = [];
  loading: boolean = false;
  isUserUpdatingState = false;
  filtroActual: string = USER_FILTER_ALL;

  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  searchText = '';

  showConfirmModal = false;
  changesToConfirm: ModelChange[] = [];
  pendingRowToToggle: User | null = null;

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

    this.userService.getAll(this.currentPage, this.pageSize, this.searchText, backendStatus, 'player').subscribe({
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

          return {
            ...u,
            name: u.name || DEFAULT_USER_NAME_LABEL,
            username: u.username || '',
            roleText: ROLE_USUARIO,
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
      if (evento.actionId === USER_ACTION_TOGGLE_STATUS) {
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
            campo: 'Estado del Jugador',
            anterior: current,
            nuevo: nextState,
          },
        ];
        this.showConfirmModal = true;
      }
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
          console.error('Error al cambiar estado de jugador:', err);
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
}
