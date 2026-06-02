import { TableColumn } from '../../interfaces/api/table-column.interface';
import { FilterOption } from '../../interfaces/api/filter-option.interface';
import { DropdownAction } from '../../interfaces/api/dropdown-action.interface';

import { User } from '../../interfaces/api/user.interface';

export const USERS_PRINCIPAL_HEADER = 'Lista Usuarios';

export const USERS_COLUMNS: TableColumn[] = [
  { field: 'name', header: 'NOMBRE USUARIO' },
  { field: 'email', header: 'Correo' },
  { field: 'phone', header: 'Telefono' },
  { field: 'role', header: 'ROL' },
  { field: 'status', header: 'ESTADO', type: 'badge' },
  { field: 'actions', header: 'ACCIONES', type: 'actions' },
];

export const USER_STATUS_ACTIVE = 'ACTIVO';
export const USER_STATUS_INACTIVE = 'INACTIVO';
export const STATE_DELETED = 'ELIMINADO';

export const USER_FILTER_ALL = 'all';
export const USER_FILTER_INACTIVE = 'desactivado';
export const USER_FILTER_DELETE = 'eliminados';

export const USER_ACTION_EDIT = 1;
export const USER_ACTION_TOGGLE_STATUS = 2;
export const USER_ACTION_DELETE = 3;

export const USERS_FILTERS: FilterOption[] = [
  { id: USER_FILTER_ALL, icon: 'bi-list-ul', label: 'Todo' },
  { id: USER_FILTER_INACTIVE, icon: 'bi-eye-slash', label: 'Desactivados' },
  { id: USER_FILTER_DELETE, icon: 'bi-trash', label: 'Eliminados' },
];

export const USER_ROW_ACTIONS: DropdownAction[] = [
  { id: USER_ACTION_EDIT, icon: 'bi-pencil-square', label: 'Editar' },
  { id: USER_ACTION_TOGGLE_STATUS, icon: 'bi-arrow-repeat', label: 'Cambiar Estado' },
  { id: USER_ACTION_DELETE, icon: 'bi-trash', label: 'Eliminar' },
];

export const USERS_DATA_MOCK: User[] = [];
