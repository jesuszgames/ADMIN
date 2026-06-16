import { TableColumn } from '../../interfaces/api/table-column.interface';
import { FilterOption } from '../../interfaces/api/filter-option.interface';
import { DropdownAction } from '../../interfaces/api/dropdown-action.interface';

export const USERS_PRINCIPAL_HEADER = 'Lista Staff / Administradores';

export const USERS_COLUMNS: TableColumn[] = [
  { field: 'name', header: 'NOMBRE COMPLETO' },
  { field: 'username', header: 'USUARIO' },
  { field: 'email', header: 'Correo' },
  { field: 'phone', header: 'Telefono' },
  { field: 'roleText', header: 'ROL', type: 'badge' },
  { field: 'status', header: 'ESTADO', type: 'badge' },
  { field: 'actions', header: 'ACCIONES', type: 'actions' },
];

export const PLAYERS_COLUMNS: TableColumn[] = [
  { field: 'username', header: 'USUARIO' },
  { field: 'balance', header: 'BALANCE' },
  { field: 'createdAtText', header: 'FECHA CREACIÓN' },
  { field: 'updatedAtText', header: 'FECHA EDICIÓN' },
  { field: 'status', header: 'ESTADO', type: 'badge' },
  { field: 'actions', header: 'ACCIONES', type: 'actions' },
];

export const USER_STATUS_ACTIVE = 'ACTIVE';
export const USER_STATUS_INACTIVE = 'INACTIVE';
export const STATE_DELETED = 'DELETED';

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

