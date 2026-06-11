import { TableColumn } from '../../interfaces/api/table-column.interface';
import { DropdownAction } from '../../interfaces/api/dropdown-action.interface';
import {
  TABLE_ACTION_VIEW_DETAIL,
  TABLE_ACTION_VIEW_TICKETS,
  TABLE_ACTION_DASHBOARD_DELETE,
  TABLE_ACTION_VIEW_UNLINK_LOGS,
} from '../ui/constants';

export const DEFAULT_USER_NAME = 'Usuario';
export const DASHBOARD_PRINCIPAL_HEADER = 'Rifas Recientes';

export const PERSO_PAGE_SIZE = 5;


export const DASHBOARD_COLUMNS: TableColumn[] = [
  { field: 'title', header: 'Nombre Rifa' },
  { field: 'foundation', header: 'Fundación' },
  { field: 'category', header: 'Categoría' },
  { field: 'collectedStr', header: 'Total Recaudado' },
  { field: 'drawMethod', header: 'Método Sorteo', type: 'badge' },
  { field: 'status', header: 'Estado', type: 'badge' },
  { field: 'winner', header: 'Boleto Ganador' },
  { field: 'actions', header: 'Acciones', type: 'actions' },
];

export const HISTORY_ROW_ACTIONS: DropdownAction[] = [
  { id: TABLE_ACTION_VIEW_DETAIL, icon: 'bi-eye', label: 'Visualizar Detalle' },
  { id: TABLE_ACTION_VIEW_TICKETS, icon: 'bi-ticket', label: 'Visualizar Boletos' },
  { id: TABLE_ACTION_VIEW_UNLINK_LOGS, icon: 'bi-journal-text', label: 'Ver Desvinculaciones' },
  { id: TABLE_ACTION_DASHBOARD_DELETE, icon: 'bi-trash', label: 'Eliminar' },
];

export const DEFAULT_MONEY_GOAL = 3000;
export const BENEFICIARY_PERCENTAGE = 80;
export const WINNER_PERCENTAGE = 20;
export const TICKETS_TOTAL_COUNT = 100;


export const DEFAULT_RAFFLE_PHOTO = '';
