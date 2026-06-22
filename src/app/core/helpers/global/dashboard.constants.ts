import { TableColumn } from '../../interfaces/api/table-column.interface';
import { DropdownAction } from '../../interfaces/api/dropdown-action.interface';
import {
  TABLE_ACTION_VIEW_DETAIL,
  TABLE_ACTION_VIEW_TICKETS,
  TABLE_ACTION_DASHBOARD_DELETE,
  TABLE_ACTION_VIEW_UNLINK_LOGS,
} from '../ui/constants';

// Re-exported from auth.constants.ts to keep a single source of truth.
export { DEFAULT_USER_NAME } from '../global/auth.constants';

// Re-exported from raffle.constants.ts because legacy consumers (utils.ts)
// imported these constants from this module. Keeping the re-exports avoids
// a cascade of import-path changes in files we are not touching today.
export {
  DEFAULT_MONEY_GOAL,
  BENEFICIARY_PERCENTAGE,
  WINNER_PERCENTAGE,
  DEFAULT_RAFFLE_PHOTO,
} from '../global/raffle.constants';

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
];

export const HISTORY_ROW_ACTIONS: DropdownAction[] = [
  { id: TABLE_ACTION_VIEW_DETAIL, icon: 'bi-eye', label: 'Visualizar Detalle' },
  { id: TABLE_ACTION_VIEW_TICKETS, icon: 'bi-ticket', label: 'Visualizar Boletos' },
  { id: TABLE_ACTION_VIEW_UNLINK_LOGS, icon: 'bi-journal-text', label: 'Ver Desvinculaciones' },
  { id: TABLE_ACTION_DASHBOARD_DELETE, icon: 'bi-trash', label: 'Eliminar' },
];