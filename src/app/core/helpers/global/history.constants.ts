import { FilterOption } from '../../../shared/components/filter/filter';
import { TableColumn } from '../../../shared/components/tables/tables';
import { DropdownAction } from '../../../shared/components/dropdown/dropdown';
import {
  TABLE_ACTION_VIEW_DETAIL,
  TABLE_ACTION_VIEW_TICKETS,
  TABLE_ACTION_DASHBOARD_DELETE,
  TABLE_ACTION_VIEW_UNLINK_LOGS,
} from '../ui/constants';

import { Raffle } from '../../interfaces/api/raffle.interface';

export const STATE_DELETED = 'ELIMINADO';
export const METHOD_AUTOMATIC = 'AUTOMATICO';

export interface HistoryRaffle extends Raffle {
  goal: number;
}

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

export const MY_HISTORY_DATA_MOCK: HistoryRaffle[] = [
  {
    _id: '603d21bf9f8b2c001f8ee3d1',
    title: 'Donacion de viveres',
    foundation: 'LUCHA CONTRA EL HAMBRE',
    category: 'ASISTENCIA SOCIAL',
    status: 'FINALIZADA',
    soldTickets: 100,
    totalTickets: 100,
    collected: 3000,
    goal: 3000,
    winner: '07',
    actions: '',
    drawMethod: 'AUTOMATICO',
    unlinks: [
      {
        number: '14',
        user: 'Juan Pérez',
        purchaseId: 'TX-99812',
        reason: 'Reembolso del jugador',
        date: '25/05/2026 14:32',
      },
      {
        number: '22',
        user: 'María Gómez',
        purchaseId: 'TX-99813',
        reason: 'Error en la selección del número',
        date: '26/05/2026 09:15',
      },
    ],
  },
  {
    _id: '603d21bf9f8b2c001f8ee3d2',
    title: 'Lucha contra la deforestacion',
    foundation: 'ONE TREE',
    category: 'MEDIO AMBIENTE',
    status: 'FINALIZADA',
    soldTickets: 75,
    totalTickets: 100,
    collected: 1500,
    goal: 2000,
    winner: '08',
    actions: '',
    drawMethod: 'MANUAL',
  },
  {
    _id: '603d21bf9f8b2c001f8ee3d3',
    title: 'Lucha contra el cancer',
    foundation: 'MANOS UNIDAS',
    category: 'SALUD',
    status: 'FINALIZADA',
    soldTickets: 75,
    totalTickets: 100,
    collected: 1500,
    goal: 2000,
    winner: '50',
    actions: '',
    drawMethod: 'AUTOMATICO',
  },
  {
    _id: '603d21bf9f8b2c001f8ee3d4',
    title: 'Donacion de computadoras hp',
    foundation: 'HP ESTUDIOS',
    category: 'EDUCACION',
    status: 'FINALIZADA',
    soldTickets: 75,
    totalTickets: 100,
    collected: 1500,
    goal: 2000,
    winner: '20',
    actions: '',
  },
  {
    _id: '603d21bf9f8b2c001f8ee3d5',
    title: 'Construccion de un refugio de perros',
    foundation: 'PATITAS AL RESCATE',
    category: 'ASISTENCIA SOCIAL',
    status: 'FINALIZADA',
    soldTickets: 75,
    totalTickets: 100,
    collected: 1500,
    goal: 2000,
    winner: '05',
    actions: '',
  },
  {
    _id: '603d21bf9f8b2c001f8ee3d6',
    title: 'Depuracion del rio Ganges',
    foundation: 'CLEAN RIVER',
    category: 'MEDIO AMBIENTE',
    status: 'FINALIZADA',
    soldTickets: 75,
    totalTickets: 100,
    collected: 1500,
    goal: 2000,
    winner: '07',
    actions: '',
  },
  {
    _id: '603d21bf9f8b2c001f8ee3d7',
    title: 'Cumple sueños',
    foundation: 'LA ULTIMA VOLUNTAD',
    category: 'ASISTENCIA SOCIAL',
    status: 'FINALIZADA',
    soldTickets: 75,
    totalTickets: 100,
    collected: 1500,
    goal: 2000,
    winner: '05',
    actions: '',
  },
  {
    _id: '603d21bf9f8b2c001f8ee3d8',
    title: 'Pelea contra el acoso escolar',
    foundation: 'LUCHA CONTRA EL BULLYN ESCOLAR',
    category: 'ASISTENCIA SOCIAL',
    status: 'FINALIZADA',
    soldTickets: 75,
    totalTickets: 100,
    collected: 1500,
    goal: 2000,
    winner: '06',
    actions: '',
  },
  {
    _id: '603d21bf9f8b2c001f8ee3d9',
    title: 'Ayuda humanitaria internacional',
    foundation: 'UNICEF',
    category: 'ASISTENCIA SOCIAL',
    status: 'FINALIZADA',
    soldTickets: 100,
    totalTickets: 100,
    collected: 5000,
    goal: 5000,
    winner: '12',
    actions: '',
  },
  {
    _id: '603d21bf9f8b2c001f8ee3da',
    title: 'Reforestacion urbana',
    foundation: 'REFORESTA',
    category: 'MEDIO AMBIENTE',
    status: 'FINALIZADA',
    soldTickets: 60,
    totalTickets: 100,
    collected: 1200,
    goal: 2000,
    winner: '44',
    actions: '',
  },
  {
    _id: '603d21bf9f8b2c001f8ee3db',
    title: 'Alimentando families',
    foundation: 'BANCO DE ALIMENTOS',
    category: 'ASISTENCIA SOCIAL',
    status: 'ELIMINADO',
    soldTickets: 100,
    totalTickets: 100,
    collected: 3000,
    goal: 3000,
    winner: '99',
    actions: '',
    deleteReason: 'Incumplimiento de las políticas de la plataforma',
  },
  {
    _id: '603d21bf9f8b2c001f8ee3dc',
    title: 'Apoyo terapeutico',
    foundation: 'TELETON',
    category: 'SALUD',
    status: 'FINALIZADA',
    soldTickets: 80,
    totalTickets: 100,
    collected: 1600,
    goal: 2000,
    winner: '23',
    actions: '',
  },
];
