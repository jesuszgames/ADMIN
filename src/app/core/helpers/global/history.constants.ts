import { FilterOption } from '../../interfaces/api/filter-option.interface';
import { TableColumn } from '../../interfaces/api/table-column.interface';
import { DropdownAction } from '../../interfaces/api/dropdown-action.interface';
import {
  TABLE_ACTION_VIEW_DETAIL,
  TABLE_ACTION_VIEW_TICKETS,
  TABLE_ACTION_DASHBOARD_DELETE,
  TABLE_ACTION_VIEW_UNLINK_LOGS,
} from '../ui/constants';


export const STATE_DELETED = 'DELETED';
export const METHOD_AUTOMATIC = 'AUTOMATIC';

export const HISTORY_PRINCIPAL_HEADER = 'Historial de rifas';

export const HISTORY_COLUMNS: TableColumn[] = [
  { field: 'title', header: 'NOMBRE RIFA' },
  { field: 'foundation', header: 'FUNDACION' },
  { field: 'category', header: 'CATEGORIA' },
  { field: 'soldTicketsStr', header: 'BOLETOS VENDIDOS' },
  { field: 'collectedStr', header: 'TOTAL RECAUDADO' },
  { field: 'drawMethod', header: 'Método Sorteo', type: 'badge' },
  { field: 'status', header: 'Estado', type: 'badge' },
  { field: 'winner', header: 'BOLETO GANADOR' },
  { field: 'actions', header: 'ACCIONES', type: 'actions' },
];

export const HISTORY_FILTER_ALL = 'all';
export const HISTORY_FILTER_TICKETS = 'boletos-completados';
export const HISTORY_FILTER_GOAL = 'meta-completada';
export const HISTORY_FILTER_DELETE = 'eliminadas';

export const HISTORY_FILTER_VALUES = {
  TICKETS: 'tickets',
  GOAL: 'goal',
  DELETED: 'deleted',
} as const;

export const HISTORY_STATUS_VALUES = {
  FINISHED: 'FINISHED',
  PENDING_DRAW: 'PENDING-DRAW',
  DELETED: 'DELETED',
} as const;

export const HISTORY_FILTERS: FilterOption[] = [
  { id: HISTORY_FILTER_ALL, icon: 'bi-list-ul', label: 'Todo' },
  { id: HISTORY_FILTER_TICKETS, icon: 'bi-ticket-detailed', label: 'Boletos completados' },
  { id: HISTORY_FILTER_GOAL, icon: 'bi-check-circle', label: 'Meta completada' },
  { id: HISTORY_FILTER_DELETE, icon: 'bi-trash', label: 'Eliminadas' },
];

export const HISTORY_ROW_ACTIONS: DropdownAction[] = [
  { id: TABLE_ACTION_VIEW_DETAIL, icon: 'bi-eye', label: 'Visualizar Detalle' },
  { id: TABLE_ACTION_VIEW_TICKETS, icon: 'bi-ticket', label: 'Visualizar Boletos' },
  { id: TABLE_ACTION_VIEW_UNLINK_LOGS, icon: 'bi-journal-text', label: 'Ver Desvinculaciones' },
  { id: TABLE_ACTION_DASHBOARD_DELETE, icon: 'bi-trash', label: 'Eliminar' },
];

