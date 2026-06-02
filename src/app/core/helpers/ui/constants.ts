import { DropdownAction } from '../../interfaces/api/dropdown-action.interface';

export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_CURRENT_PAGE = 1;

export const TABLE_ACTION_EDIT_DETAIL = 1;
export const TABLE_ACTION_EDIT_TICKETS = 2;
export const TABLE_ACTION_CHANGE_STATE = 3;
export const TABLE_ACTION_DELETE = 4;
export const TABLE_ACTION_VIEW_UNLINK_LOGS = 5;

export const DEFAULT_ROW_ACTIONS: DropdownAction[] = [
  { id: TABLE_ACTION_EDIT_DETAIL, icon: 'bi-pencil-square', label: 'Editar Detalle' },
  { id: TABLE_ACTION_EDIT_TICKETS, icon: 'bi-ticket-perforated', label: 'Editar Boletos' },
  { id: TABLE_ACTION_VIEW_UNLINK_LOGS, icon: 'bi-journal-text', label: 'Ver Desvinculaciones' },
  { id: TABLE_ACTION_CHANGE_STATE, icon: 'bi-arrow-repeat', label: 'Cambiar Estado' },
  { id: TABLE_ACTION_DELETE, icon: 'bi-trash', label: 'Eliminar' },
];

export const TABLE_ACTION_VIEW_DETAIL = 1;
export const TABLE_ACTION_VIEW_TICKETS = 2;
export const TABLE_ACTION_DASHBOARD_DELETE = 3;

export const HISTORIAL_RAFFLE_OPTIONS: DropdownAction[] = [
  { id: TABLE_ACTION_VIEW_DETAIL, icon: 'bi-pencil-square', label: 'Editar Detalle' },
  { id: TABLE_ACTION_VIEW_TICKETS, icon: 'bi-ticket-perforated', label: 'Editar Boletos' },
  { id: TABLE_ACTION_DASHBOARD_DELETE, icon: 'bi-trash', label: 'Eliminar' },
];

export const BADGE_BASE_CLASS = 'badge px-3 py-2 text-uppercase font-monospace';

export const STATUS_CLASSES = {
  INACTIVE: 'badge-inactive',
  ACTIVE: 'badge-active',
  FINALIZED: 'badge-inactive',
  PROX_EXPIRED: 'badge-prox-expired',
  META_COMPLETED: 'badge-meta-completed',
  NO_TICKETS: 'badge-no-tickets',
  DELETED: 'badge-deleted',
  CANCELLED: 'badge-deleted',
  AUTOMATICO: 'badge-automatico',
  MANUAL: 'badge-manual',
  DEFAULT: 'badge-default',
};

export const BADGE_MAP: Record<string, keyof typeof STATUS_CLASSES> = {
  INACT: 'INACTIVE',
  DESACTIV: 'INACTIVE',
  ACTIV: 'ACTIVE',
  PROX: 'PROX_EXPIRED',
  META: 'META_COMPLETED',
  FINALIZ: 'FINALIZED',
  ELIMIN: 'CANCELLED',
  CANCE: 'CANCELLED',
  DELET: 'DELETED',
  SIN: 'NO_TICKETS',
  PEND: 'NO_TICKETS',
  AUTOMATICO: 'AUTOMATICO',
  MANUAL: 'MANUAL',
};

export const CONNECTION_STATUS = {
  ONLINE: 'status-dot--online',
  OFFLINE: 'status-dot--offline',
};

