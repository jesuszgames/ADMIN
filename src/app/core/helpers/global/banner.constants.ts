import {
  TABLE_ACTION_CHANGE_STATE,
  TABLE_ACTION_DELETE,
  TABLE_ACTION_EDIT_DETAIL,
} from '../ui/constants';
import { TableColumn } from '../../../core/interfaces/api/table-column.interface';

export const STATE_ACTIVE = 'ACTIVE';
export const STATE_INACTIVE = 'INACTIVE';
export const STATE_DELETED = 'DELETED';

export const BANNERS_PRINCIPAL_HEADER = {
  title: 'Gestión de Banners',
  description: 'Administra los banners promocionales del carrusel',
};

export const BANNERS_COLUMNS: TableColumn[] = [
  { header: 'Título', field: 'title' },
  { header: 'Rifa Asociada', field: 'raffleName' },
  { header: 'Enlace (URL)', field: 'linkUrl' },
  { header: 'Estado', field: 'status', type: 'badge' },
  { header: 'Acciones', field: 'actions', type: 'actions' }
];

export const BANNER_ROW_ACTIONS = [
  { id: TABLE_ACTION_EDIT_DETAIL, icon: 'bi bi-pencil-square', label: 'Editar/Detalle' },
  { id: TABLE_ACTION_CHANGE_STATE, icon: 'bi bi-arrow-repeat', label: 'Cambiar estado' },
  { id: TABLE_ACTION_DELETE, icon: 'bi bi-trash-fill', label: 'Eliminar' },
];
