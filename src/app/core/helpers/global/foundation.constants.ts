import { FilterOption } from '../../interfaces/api/filter-option.interface';
import { TableColumn } from '../../interfaces/api/table-column.interface';
import { DropdownAction } from '../../interfaces/api/dropdown-action.interface';
import {
  TABLE_ACTION_CHANGE_STATE,
  TABLE_ACTION_DELETE,
  TABLE_ACTION_EDIT_DETAIL,
} from '../ui/constants';

export const STATE_ACTIVE = 'ACTIVE';
export const STATE_INACTIVE = 'INACTIVE';
export const STATE_DELETED = 'DELETED';

export const MY_FOUNDATIONS_PRINCIPAL_HEADER = 'Fundaciones';

export const MY_FOUNDATIONS_COLUMNS: TableColumn[] = [
  { field: 'name', header: 'NOMBRE FUNDACION' },
  { field: 'description', header: 'DESCRIPCION' },
  { field: 'email', header: 'CORREO' },
  { field: 'phone', header: 'TELEFONO' },
  { field: 'status', header: 'ESTADO', type: 'badge' },
  { field: 'actions', header: 'ACCIONES', type: 'actions' },
];

export const FOUNDATION_FILTER_ALL = 'all';
export const FOUNDATION_FILTER_INACTIVE = 'desactivados';
export const FOUNDATION_FILTER_DELETE = 'eliminados';

export const FOUNDATION_FILTERS: FilterOption[] = [
  { id: FOUNDATION_FILTER_ALL, icon: 'bi-list-ul', label: 'Todo' },
  { id: FOUNDATION_FILTER_INACTIVE, icon: 'bi-eye-slash', label: 'Desactivadas' },
  { id: FOUNDATION_FILTER_DELETE, icon: 'bi-trash', label: 'Eliminados' },
];

export const FOUNDATION_ROW_ACTIONS: DropdownAction[] = [
  { id: TABLE_ACTION_EDIT_DETAIL, icon: 'bi-pencil-square', label: 'Editar Fundación' },
  { id: TABLE_ACTION_CHANGE_STATE, icon: 'bi-arrow-repeat', label: 'Cambiar Estado' },
  { id: TABLE_ACTION_DELETE, icon: 'bi-trash', label: 'Eliminar' },
];
