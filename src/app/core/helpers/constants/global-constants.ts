import { DropdownAction } from '../../../shared/components/dropdown/dropdown';

export const TABLE_ACTION_EDIT_DETAIL = 1;
export const TABLE_ACTION_EDIT_TICKETS = 2;
export const TABLE_ACTION_CHANGE_STATE = 3;
export const TABLE_ACTION_DELETE = 4;

export const DEFAULT_ROW_ACTIONS: DropdownAction[] = [
  { id: TABLE_ACTION_EDIT_DETAIL, icon: 'bi-pencil-square', label: 'Editar Detalle' },
  { id: TABLE_ACTION_EDIT_TICKETS, icon: 'bi-ticket-perforated', label: 'Editar Boletos' },
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
  INACTIVE: 'bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-20',
  ACTIVE: 'bg-primary bg-opacity-10 text-primary border border-primary border-opacity-20',
  FINALIZED: 'bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-20',
  PROX_EXPIRED: 'bg-warning bg-opacity-10 text-warning border border-warning border-opacity-20',
  META_COMPLETED: 'bg-success bg-opacity-10 text-success border border-success border-opacity-20',
  NO_TICKETS: 'bg-info bg-opacity-10 text-info border border-info border-opacity-20',
  DELETED: 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-20',
  CANCELLED: 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-20',
  DEFAULT: 'bg-dark bg-opacity-25 text-white border border-dark border-opacity-20',
};

export const STATE_ACTIVE = 'ACTIVO';
export const STATE_INACTIVE = 'DESACTIVADO';
export const STATE_DELETED = 'ELIMINADO';
