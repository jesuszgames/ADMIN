import { TableColumn } from '../../interfaces/api/table-column.interface';
import { DropdownAction } from '../../interfaces/api/dropdown-action.interface';
import {
  TABLE_ACTION_VIEW_DETAIL,
  TABLE_ACTION_VIEW_TICKETS,
  TABLE_ACTION_DASHBOARD_DELETE,
  TABLE_ACTION_VIEW_UNLINK_LOGS,
} from '../ui/constants';
export { DEFAULT_USER_NAME } from '../global/auth.constants';
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
  { field: 'winner', header: 'Boleto Ganador' },
];

export const HISTORY_ROW_ACTIONS: DropdownAction[] = [
  { id: TABLE_ACTION_VIEW_DETAIL, icon: 'bi-eye', label: 'Visualizar Detalle' },
  { id: TABLE_ACTION_VIEW_TICKETS, icon: 'bi-ticket', label: 'Visualizar Boletos' },
  { id: TABLE_ACTION_VIEW_UNLINK_LOGS, icon: 'bi-journal-text', label: 'Ver Desvinculaciones' },
  { id: TABLE_ACTION_DASHBOARD_DELETE, icon: 'bi-trash', label: 'Eliminar' },
];

// Paleta centralizada para los charts del dashboard.
// Se usa en el área chart (línea tendencia) y en el doughnut de categorías.
export const DASHBOARD_CHART_PALETTE = [
  '#0d6efd',
  '#20c997',
  '#ffc107',
  '#dc3545',
  '#6c757d',
] as const;

export const DASHBOARD_CHART_TREND_COLOR = '#0d6efd';
export const DASHBOARD_CHART_BAR_COLOR = 'rgba(32, 201, 151, 0.85)';
export const DASHBOARD_CHART_BAR_HOVER = '#20c997';

// Tema oscuro común para los ejes de los charts de línea y barra.
export const DARK_AXIS_TICKS = 'rgba(255, 255, 255, 0.5)';
export const DARK_AXIS_GRID = 'rgba(255, 255, 255, 0.08)';
export const DARK_LEGEND = 'rgba(255, 255, 255, 0.7)';

// Doughnut: cuantas categorías principales mostrar antes de agrupar el resto en "Otros".
export const DOUGHNUT_TOP_N = 4;
