import { TableColumn } from '../../interfaces/api/table-column.interface';
import { FilterOption } from '../../interfaces/api/filter-option.interface';
import { Raffle } from '../../interfaces/api/raffle.interface';

export const RAFFLE_STATUS_ACTIVE = 'ACTIVE';
export const RAFFLE_STATUS_INACTIVE = 'INACTIVE';
export const RAFFLE_STATUS_NO_TICKETS = 'NO TICKETS';
export const RAFFLE_STATUS_PROX_EXPIRED = 'SOON TO EXPIRE';
export const RAFFLE_STATUS_META_COMPLETED = 'GOAL COMPLETED';
export const STATE_DELETED = 'DELETED';
export const METHOD_AUTOMATIC = 'AUTOMATIC';
export const METHOD_MANUAL = 'MANUAL';

export const DEFAULT_RAFFLE_START_DATE = '2026-05-10';
export const DEFAULT_RAFFLE_END_DATE = '2026-05-20';
export const DEFAULT_RAFFLE_META = 10000;
export const DEFAULT_RAFFLE_TICKETS_TOTAL = 100;
export const DEFAULT_RAFFLE_TICKET_PRICE = 5;
export const DEFAULT_RAFFLE_BENEFICIARY_PERCENT = 80;
export const DEFAULT_RAFFLE_WINNER_PERCENT = 20;
export const DEFAULT_RAFFLE_BLOG_CARD = 'Ayuda a personas necesitadas.';
export const DEFAULT_RAFFLE_BLOG_DETAIL = 'Esta rifa apoya la causa social.';
export const DEFAULT_RAFFLE_PHOTO = '';
export const DEFAULT_RAFFLE_TIME_LEFT = '15 dias';
export const DEFAULT_RAFFLE_METODO_SORTEO: 'AUTOMATIC' | 'MANUAL' = 'AUTOMATIC';

// Fallback values used by the raffle detail mapper when the API does not
// return the corresponding field. Defined here (not in dashboard.constants.ts)
// because they belong to the raffle domain, not the dashboard UI.
export const DEFAULT_MONEY_GOAL = 3000;
export const BENEFICIARY_PERCENTAGE = 80;
export const WINNER_PERCENTAGE = 20;

export const MY_RAFFLES_PRINCIPAL_HEADER = 'Rifas Activas';

export const MY_RAFFLES_COLUMNS: TableColumn[] = [
  { field: 'title', header: 'Nombre Rifa' },
  { field: 'foundation', header: 'Fundación' },
  { field: 'category', header: 'Categoría' },
  { field: 'soldTicketsStr', header: 'Boletos Vendidos' },
  { field: 'collectedStr', header: 'Total Recaudado' },
  { field: 'drawMethod', header: 'Sorteo', type: 'badge' },
  { field: 'statusDisplay', header: 'Estado', type: 'badge' },
  { field: 'remainingTime', header: 'Tiempo Restante' },
  { field: 'actions', header: 'Acciones', type: 'actions' },
];

export const RAFFLE_FILTER_ALL = 'all';
export const RAFFLE_FILTER_INACTIVE = 'inactiva';
export const RAFFLE_FILTER_NO_TICKETS = 'sin-boletos';
export const RAFFLE_FILTER_PROX_EXPIRED = 'proximo-vencer';
export const RAFFLE_FILTER_META_COMPLETED = 'meta-completada';
export const RAFFLE_FILTER_PENDING_DRAW = 'pendiente-sorteo';
export const RAFFLE_FILTER_DELETE = 'eliminadas';
export const RAFFLE_FILTER_MANUAL = 'manual';
export const RAFFLE_FILTER_AUTOMATIC = 'automatico';

export const RAFFLE_FILTER_VALUES = {
  NO_TICKETS: 'NO-TICKETS',
  INACTIVE: 'INACTIVE',
  GOAL: 'GOAL',
  SOON_TO_EXPIRED: 'SOON-TO-EXPIRED',
  PENDING_DRAW: 'PENDING-DRAW',
  TICKETS: 'tickets',
  DELETED: 'deleted',
} as const;

export const MY_RAFFLES_FILTERS: FilterOption[] = [
  { id: RAFFLE_FILTER_ALL, icon: 'bi-list-ul', label: 'Todo' },
  { id: RAFFLE_FILTER_INACTIVE, icon: 'bi-ban', label: 'Inactiva' },
  { id: RAFFLE_FILTER_PENDING_DRAW, icon: 'bi-clock-history', label: 'Pendiente Sorteo' },
  { id: RAFFLE_FILTER_MANUAL, icon: 'bi-ticket-perforated', label: 'Manual' },
  { id: RAFFLE_FILTER_AUTOMATIC, icon: 'bi-ticket-perforated', label: 'Automatico' },
  { id: RAFFLE_FILTER_NO_TICKETS, icon: 'bi-ticket-perforated', label: 'Sin Boletos' },
  { id: RAFFLE_FILTER_PROX_EXPIRED, icon: 'bi-hourglass', label: 'Próximo a vencer' },
  { id: RAFFLE_FILTER_META_COMPLETED, icon: 'bi-check-all', label: 'Meta Completada' },
];

