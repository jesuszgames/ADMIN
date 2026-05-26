import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Filter } from '../../../../shared/components/filter/filter';
import { Tables } from '../../../../shared/components/tables/tables';
import { DeleteModal } from '../../../../shared/components/delete-modal/delete-modal';
import {
  USERS_PRINCIPAL_HEADER,
  USERS_COLUMNS,
  USERS_FILTERS,
  USER_ROW_ACTIONS,
  USERS_DATA_MOCK,
  USER_ACTION_TOGGLE_STATUS,
  USER_ACTION_DELETE,
  USER_STATUS_ACTIVE,
  USER_STATUS_INACTIVE,
  USER_FILTER_ALL,
  USER_FILTER_INACTIVE,
} from '../../../../core/helpers/constants/users-constants';
import { User } from '../../../../core/interfaces/user.interface';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, Filter, Tables, DeleteModal],
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

  private readonly BTN_DELETE_USER_ID = 'btn-abrir-modal-delete-user';

  constructor() {
    this.tableData = this.getFilteredData(this.filtroActual);
  }

  filtrarPorEstado(estadoId: string) {
    this.filtroActual = estadoId;
    this.tableData = this.getFilteredData(estadoId);
  }

  manejarAccion(evento: { actionId: number; row: User }) {
    if (evento.actionId === USER_ACTION_TOGGLE_STATUS) {
      const userIndex = this.usersData.findIndex((u) => u.id === evento.row.id);
      if (userIndex !== -1) {
        this.usersData[userIndex].estado =
          this.usersData[userIndex].estado === USER_STATUS_ACTIVE
            ? USER_STATUS_INACTIVE
            : USER_STATUS_ACTIVE;
        this.tableData = this.getFilteredData(this.filtroActual);
      }
    } else if (evento.actionId === USER_ACTION_DELETE) {
      this.userSeleccionadoParaBorrar = evento.row;
      document.getElementById(this.BTN_DELETE_USER_ID)?.click();
    }
  }

  confirmarEliminar() {
    if (this.userSeleccionadoParaBorrar) {
      this.usersData = this.usersData.filter((u) => u.id !== this.userSeleccionadoParaBorrar!.id);
      this.tableData = this.getFilteredData(this.filtroActual);
      this.userSeleccionadoParaBorrar = null;
    }
  }

  private getFilteredData(filterId: string): User[] {
    let filtered = this.usersData;
    if (filterId === USER_FILTER_INACTIVE) {
      filtered = this.usersData.filter((u) => u.estado === USER_STATUS_INACTIVE);
    }
    return filtered.map((user) => ({ ...user }));
  }
}
