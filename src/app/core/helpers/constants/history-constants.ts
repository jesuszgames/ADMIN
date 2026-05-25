import { FilterOption } from '../../../shared/components/filter/filter';
import { TableColumn } from '../../../shared/components/tables/tables';
import { DropdownAction } from '../../../shared/components/dropdown/dropdown';
import {
  TABLE_ACTION_VIEW_DETAIL,
  TABLE_ACTION_VIEW_TICKETS,
  TABLE_ACTION_DASHBOARD_DELETE,
} from './global-constants';

export interface HistoryRaffle {
  id: number;
  nombreRifa: string;
  fundacion: string;
  categoria: string;
  estado: string;
  boletosVendidos: number;
  boletosTotales: number;
  recaudado: number;
  meta: number;
  ganador: string;
  acciones: string;
  boletosVendidosStr?: string;
  recaudadoStr?: string;
  numerosAsociados?: string;
  ganadorName?: string;
  ganadorEmail?: string;
  ganadorPhone?: string;
  beneficiaryPercentage?: number;
  winnerPercentage?: number;
  startDate?: string;
  endDate?: string;
  ticketPrice?: number;
  photo?: string;
  blogCardText?: string;
  blogDetailText?: string;
  [key: string]: unknown;
}

export const HISTORY_PRINCIPAL_HEADER = 'Historial de rifas';

export const HISTORY_COLUMNS: TableColumn[] = [
  { field: 'nombreRifa', header: 'NOMBRE RIFA' },
  { field: 'fundacion', header: 'FUNDACION' },
  { field: 'categoria', header: 'CATEGORIA' },
  { field: 'estado', header: 'ESTADO', type: 'badge' },
  { field: 'boletosVendidosStr', header: 'BOLETOS VENDIDOS' },
  { field: 'recaudadoStr', header: 'TOTAL RECAUDADO' },
  { field: 'ganador', header: 'BOLETO GANADOR' },
  { field: 'acciones', header: 'ACCIONES', type: 'actions' },
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
  { id: TABLE_ACTION_DASHBOARD_DELETE, icon: 'bi-trash', label: 'Eliminar' },
];

export const MY_HISTORY_DATA_MOCK: HistoryRaffle[] = [
  {
    id: 1,
    nombreRifa: 'Donacion de viveres',
    fundacion: 'LUCHA CONTRA EL HAMBRE',
    categoria: 'ASISTENCIA SOCIAL',
    estado: 'FINALIZADA',
    boletosVendidos: 100,
    boletosTotales: 100,
    recaudado: 3000,
    meta: 3000,
    ganador: '07',
    acciones: '',
  },
  {
    id: 2,
    nombreRifa: 'Lucha contra la deforestacion',
    fundacion: 'ONE TREE',
    categoria: 'MEDIO AMBIENTE',
    estado: 'FINALIZADA',
    boletosVendidos: 75,
    boletosTotales: 100,
    recaudado: 1500,
    meta: 2000,
    ganador: '08',
    acciones: '',
  },
  {
    id: 3,
    nombreRifa: 'Lucha contra el cancer',
    fundacion: 'MANOS UNIDAS',
    categoria: 'SALUD',
    estado: 'FINALIZADA',
    boletosVendidos: 75,
    boletosTotales: 100,
    recaudado: 1500,
    meta: 2000,
    ganador: '50',
    acciones: '',
  },
  {
    id: 4,
    nombreRifa: 'Donacion de computadoras hp',
    fundacion: 'HP ESTUDIOS',
    categoria: 'EDUCACION',
    estado: 'FINALIZADA',
    boletosVendidos: 75,
    boletosTotales: 100,
    recaudado: 1500,
    meta: 2000,
    ganador: '20',
    acciones: '',
  },
  {
    id: 5,
    nombreRifa: 'Construccion de un refugio de perros',
    fundacion: 'PATITAS AL RESCATE',
    categoria: 'ASISTENCIA SOCIAL',
    estado: 'FINALIZADA',
    boletosVendidos: 75,
    boletosTotales: 100,
    recaudado: 1500,
    meta: 2000,
    ganador: '05',
    acciones: '',
  },
  {
    id: 6,
    nombreRifa: 'Depuracion del rio Ganges',
    fundacion: 'CLEAN RIVER',
    categoria: 'MEDIO AMBIENTE',
    estado: 'FINALIZADA',
    boletosVendidos: 75,
    boletosTotales: 100,
    recaudado: 1500,
    meta: 2000,
    ganador: '07',
    acciones: '',
  },
  {
    id: 7,
    nombreRifa: 'Cumple sueños',
    fundacion: 'LA ULTIMA VOLUNTAD',
    categoria: 'ASISTENCIA SOCIAL',
    estado: 'FINALIZADA',
    boletosVendidos: 75,
    boletosTotales: 100,
    recaudado: 1500,
    meta: 2000,
    ganador: '05',
    acciones: '',
  },
  {
    id: 8,
    nombreRifa: 'Pelea contra el acoso escolar',
    fundacion: 'LUCHA CONTRA EL BULLYN ESCOLAR',
    categoria: 'ASISTENCIA SOCIAL',
    estado: 'FINALIZADA',
    boletosVendidos: 75,
    boletosTotales: 100,
    recaudado: 1500,
    meta: 2000,
    ganador: '06',
    acciones: '',
  },
  {
    id: 9,
    nombreRifa: 'Ayuda humanitaria internacional',
    fundacion: 'UNICEF',
    categoria: 'ASISTENCIA SOCIAL',
    estado: 'FINALIZADA',
    boletosVendidos: 100,
    boletosTotales: 100,
    recaudado: 5000,
    meta: 5000,
    ganador: '12',
    acciones: '',
  },
  {
    id: 10,
    nombreRifa: 'Reforestacion urbana',
    fundacion: 'REFORESTA',
    categoria: 'MEDIO AMBIENTE',
    estado: 'FINALIZADA',
    boletosVendidos: 60,
    boletosTotales: 100,
    recaudado: 1200,
    meta: 2000,
    ganador: '44',
    acciones: '',
  },
  {
    id: 11,
    nombreRifa: 'Alimentando familias',
    fundacion: 'BANCO DE ALIMENTOS',
    categoria: 'ASISTENCIA SOCIAL',
    estado: 'ELIMINADO',
    boletosVendidos: 100,
    boletosTotales: 100,
    recaudado: 3000,
    meta: 3000,
    ganador: '99',
    acciones: '',
  },
  {
    id: 12,
    nombreRifa: 'Apoyo terapeutico',
    fundacion: 'TELETON',
    categoria: 'SALUD',
    estado: 'FINALIZADA',
    boletosVendidos: 80,
    boletosTotales: 100,
    recaudado: 1600,
    meta: 2000,
    ganador: '23',
    acciones: '',
  },
];
