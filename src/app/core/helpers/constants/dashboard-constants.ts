import { TableColumn } from '../../../shared/components/tables/tables';
import { Raffle } from '../../interfaces/raffle.interface';
import { DropdownAction } from '../../../shared/components/dropdown/dropdown';
import {
  TABLE_ACTION_VIEW_DETAIL,
  TABLE_ACTION_VIEW_TICKETS,
  TABLE_ACTION_DASHBOARD_DELETE,
} from './global-constants';

export const DEFAULT_USER_NAME = 'Usuario';
export const DASHBOARD_PRINCIPAL_HEADER = 'Rifas Recientes';

export const PERSO_PAGE_SIZE = 5;

export const DASHBOARD_CARDS = [
  { label: 'Recaudado', value: '0' },
  { label: 'Beneficiarios', value: '0' },
  { label: 'Ganadores', value: '0' },
  { label: 'Activas', value: '0' },
  { label: 'Sin boletos', value: '0' },
  { label: 'Finalizados', value: '0' },
];

export const DASHBOARD_COLUMNS: TableColumn[] = [
  { field: 'nombreRifa', header: 'Nombre Rifa' },
  { field: 'fundacion', header: 'Fundación' },
  { field: 'categoria', header: 'Categoría' },
  { field: 'estado', header: 'Estado', type: 'badge' },
  { field: 'recaudadoStr', header: 'Total Recaudado' },
  { field: 'ganador', header: 'Boleto Ganador' },
  { field: 'acciones', header: 'Acciones', type: 'actions' },
];

export const HISTORY_ROW_ACTIONS: DropdownAction[] = [
  { id: TABLE_ACTION_VIEW_DETAIL, icon: 'bi-eye', label: 'Visualizar Detalle' },
  { id: TABLE_ACTION_VIEW_TICKETS, icon: 'bi-ticket', label: 'Visualizar Boletos' },
  { id: TABLE_ACTION_DASHBOARD_DELETE, icon: 'bi-trash', label: 'Eliminar' },
];

export const DEFAULT_MONEY_GOAL = 3000;
export const BENEFICIARY_PERCENTAGE = 80;
export const WINNER_PERCENTAGE = 20;
export const TICKETS_TOTAL_COUNT = 100;

export const RECENT_RAFFLES_MOCK: Raffle[] = [
  {
    id: 1,
    nombreRifa: 'translation by H. Rackham',
    fundacion: 'COMPU TRON',
    categoria: 'TECNOLOGIA',
    estado: 'FINALIZADO',
    boletosVendidos: 100,
    boletosTotales: 100,
    recaudado: 13000,
    meta: 20000,
    ganador: '07',
    acciones: '',
    beneficiaryPercentage: 75,
    winnerPercentage: 25,
    ticketPrice: 130,
    photo:
      'data:image/jpeg;base64,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',
    startDate: '01/05/2026',
    endDate: '15/05/2026',
    blogCardText: 'Tecnología para escuelas rurales.',
    blogDetailText:
      'Esta rifa apoya el equipamiento tecnológico de 15 escuelas rurales en zonas de alta vulnerabilidad. Cada boleto ayuda a comprar computadoras y proyectores.',
    ganadorName: 'Carlos Mendoza Ramos',
    ganadorEmail: 'carlos.mendoza@email.com',
    ganadorPhone: '0987654321',
    numerosAsociados: '[03] [07] [25]',
  },
  {
    id: 2,
    nombreRifa: 'The standard Lorem Ipsum passage',
    fundacion: 'CLEAN OCEAN',
    categoria: 'MEDIO AMBIENTE',
    estado: 'FINALIZADA',
    boletosVendidos: 50,
    boletosTotales: 100,
    recaudado: 20000,
    meta: 2000,
    ganador: '08',
    acciones: '',
    beneficiaryPercentage: 85,
    winnerPercentage: 15,
    ticketPrice: 400,
    photo:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1KDWZN_MTts59Exv5aVsmvECW3f1InPzl0A&s',
    startDate: '05/05/2026',
    endDate: '20/05/2026',
    blogCardText: 'Limpieza de microplásticos en las playas.',
    blogDetailText:
      'Apoya las jornadas de recolección de residuos marinos y microplásticos en las costas del Pacífico. Únete y ayuda a restaurar la fauna marina.',
    ganadorName: 'Elena Flores Silva',
    ganadorEmail: 'elena.flores@email.com',
    ganadorPhone: '0991234567',
    numerosAsociados: '[08] [12]',
  },
  {
    id: 3,
    nombreRifa: 'The standard Lorem Ipsum passage',
    fundacion: 'CLEAN OCEAN',
    categoria: 'MEDIO AMBIENTE',
    estado: 'FINALIZADA',
    boletosVendidos: 50,
    boletosTotales: 100,
    recaudado: 20000,
    meta: 2000,
    ganador: '08',
    acciones: '',
  },
  {
    id: 4,
    nombreRifa: 'The standard Lorem Ipsum passage',
    fundacion: 'CLEAN OCEAN',
    categoria: 'MEDIO AMBIENTE',
    estado: 'FINALIZADA',
    boletosVendidos: 50,
    boletosTotales: 100,
    recaudado: 20000,
    meta: 2000,
    ganador: '08',
    acciones: '',
  },
  {
    id: 5,
    nombreRifa: 'The standard Lorem Ipsum passage',
    fundacion: 'CLEAN OCEAN',
    categoria: 'MEDIO AMBIENTE',
    estado: 'FINALIZADA',
    boletosVendidos: 50,
    boletosTotales: 100,
    recaudado: 20000,
    meta: 2000,
    ganador: '08',
    acciones: '',
  },
  {
    id: 6,
    nombreRifa: 'The standard Lorem Ipsum passage',
    fundacion: 'CLEAN OCEAN',
    categoria: 'MEDIO AMBIENTE',
    estado: 'FINALIZADA',
    boletosVendidos: 50,
    boletosTotales: 100,
    recaudado: 20000,
    meta: 2000,
    ganador: '08',
    acciones: '',
  },
  {
    id: 7,
    nombreRifa: 'The standard Lorem Ipsum passage',
    fundacion: 'CLEAN OCEAN',
    categoria: 'MEDIO AMBIENTE',
    estado: 'FINALIZADA',
    boletosVendidos: 50,
    boletosTotales: 100,
    recaudado: 20000,
    meta: 2000,
    ganador: '08',
    acciones: '',
  },
  {
    id: 8,
    nombreRifa: 'The standard Lorem Ipsum passage',
    fundacion: 'CLEAN OCEAN',
    categoria: 'MEDIO AMBIENTE',
    estado: 'FINALIZADA',
    boletosVendidos: 50,
    boletosTotales: 100,
    recaudado: 20000,
    meta: 2000,
    ganador: '08',
    acciones: '',
  },
  {
    id: 9,
    nombreRifa: 'The standard Lorem Ipsum passage',
    fundacion: 'CLEAN OCEAN',
    categoria: 'MEDIO AMBIENTE',
    estado: 'FINALIZADA',
    boletosVendidos: 50,
    boletosTotales: 100,
    recaudado: 20000,
    meta: 2000,
    ganador: '08',
    acciones: '',
  },
  {
    id: 10,
    nombreRifa: 'The standard Lorem Ipsum passage',
    fundacion: 'CLEAN OCEAN',
    categoria: 'MEDIO AMBIENTE',
    estado: 'FINALIZADA',
    boletosVendidos: 50,
    boletosTotales: 100,
    recaudado: 20000,
    meta: 2000,
    ganador: '08',
    acciones: '',
  },
  {
    id: 11,
    nombreRifa: 'The standard Lorem Ipsum passage',
    fundacion: 'CLEAN OCEAN',
    categoria: 'MEDIO AMBIENTE',
    estado: 'FINALIZADA',
    boletosVendidos: 50,
    boletosTotales: 100,
    recaudado: 20000,
    meta: 2000,
    ganador: '08',
    acciones: '',
  },
];

export const DEFAULT_RAFFLE_PHOTO = '';
