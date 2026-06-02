import { Raffle } from '../../interfaces/api/raffle.interface';
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

export const DASHBOARD_CARDS = [
  { label: 'Recaudado', value: '0' },
  { label: 'Beneficiarios', value: '0' },
  { label: 'Ganadores', value: '0' },
  { label: 'Activas', value: '0' },
  { label: 'Sin boletos', value: '0' },
  { label: 'Finalizados', value: '0' },
];

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

export const RECENT_RAFFLES_MOCK: Raffle[] = [
  {
    _id: '603d21bf9f8b2c001f8ee3d1',
    title: 'translation by H. Rackham',
    foundation: 'COMPU TRON',
    category: 'TECNOLOGIA',
    status: 'FINALIZADA',
    soldTickets: 100,
    totalTickets: 100,
    collected: 13000,
    goal: 20000,
    winner: '07',
    actions: '',
    beneficiaryPercentage: 75,
    winnerPercentage: 25,
    ticketPrice: 130,
    photo:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=400',
    startDate: '01/05/2026',
    endDate: '15/05/2026',
    blogCardText: 'Tecnología para escuelas rurales.',
    blogDetailText:
      'Esta rifa apoya el equipamiento tecnológico de 15 escuelas rurales en zonas de alta vulnerabilidad. Cada boleto ayuda a comprar computadoras y proyectores.',
    winnerName: 'Carlos Mendoza Ramos',
    winnerEmail: 'carlos.mendoza@email.com',
    winnerPhone: '0987654321',
    associatedNumbers: '[03] [07] [25]',
  },
  {
    _id: '603d21bf9f8b2c001f8ee3d2',
    title: 'The standard Lorem Ipsum passage',
    foundation: 'CLEAN OCEAN',
    category: 'MEDIO AMBIENTE',
    status: 'FINALIZADA',
    soldTickets: 50,
    totalTickets: 100,
    collected: 20000,
    goal: 2000,
    winner: '08',
    actions: '',
    beneficiaryPercentage: 85,
    winnerPercentage: 15,
    ticketPrice: 400,
    photo:
      'https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?auto=format&fit=crop&q=80&w=400',
    startDate: '05/05/2026',
    endDate: '20/05/2026',
    blogCardText: 'Limpieza de microplásticos en las playas.',
    blogDetailText:
      'Apoya las jornadas de recolección de residuos marinos y microplásticos en las costas del Pacífico. Únete y ayuda a restaurar la fauna marina.',
    winnerName: 'Elena Flores Silva',
    winnerEmail: 'elena.flores@email.com',
    winnerPhone: '0991234567',
    associatedNumbers: '[08] [12]',
  },
  {
    _id: '603d21bf9f8b2c001f8ee3d3',
    title: 'The standard Lorem Ipsum passage',
    foundation: 'CLEAN OCEAN',
    category: 'MEDIO AMBIENTE',
    status: 'FINALIZADA',
    soldTickets: 50,
    totalTickets: 100,
    collected: 20000,
    goal: 2000,
    winner: '08',
    actions: '',
    photo:
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=400',
  },
  {
    _id: '603d21bf9f8b2c001f8ee3d4',
    title: 'The standard Lorem Ipsum passage',
    foundation: 'CLEAN OCEAN',
    category: 'MEDIO AMBIENTE',
    status: 'FINALIZADA',
    soldTickets: 50,
    totalTickets: 100,
    collected: 20000,
    goal: 2000,
    winner: '08',
    actions: '',
    photo:
      'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&q=80&w=400',
  },
  {
    _id: '603d21bf9f8b2c001f8ee3d5',
    title: 'The standard Lorem Ipsum passage',
    foundation: 'CLEAN OCEAN',
    category: 'MEDIO AMBIENTE',
    status: 'FINALIZADA',
    soldTickets: 50,
    totalTickets: 100,
    collected: 20000,
    goal: 2000,
    winner: '08',
    actions: '',
    photo:
      'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&q=80&w=400',
  },
  {
    _id: '603d21bf9f8b2c001f8ee3d6',
    title: 'The standard Lorem Ipsum passage',
    foundation: 'CLEAN OCEAN',
    category: 'MEDIO AMBIENTE',
    status: 'FINALIZADA',
    soldTickets: 50,
    totalTickets: 100,
    collected: 20000,
    goal: 2000,
    winner: '08',
    actions: '',
    photo:
      'https://images.unsplash.com/photo-1472214222541-d510753a4907?auto=format&fit=crop&q=80&w=400',
  },
  {
    _id: '603d21bf9f8b2c001f8ee3d7',
    title: 'The standard Lorem Ipsum passage',
    foundation: 'CLEAN OCEAN',
    category: 'MEDIO AMBIENTE',
    status: 'FINALIZADA',
    soldTickets: 50,
    totalTickets: 100,
    collected: 20000,
    goal: 2000,
    winner: '08',
    actions: '',
    photo:
      'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=400',
  },
  {
    _id: '603d21bf9f8b2c001f8ee3d8',
    title: 'The standard Lorem Ipsum passage',
    foundation: 'CLEAN OCEAN',
    category: 'MEDIO AMBIENTE',
    status: 'FINALIZADA',
    soldTickets: 50,
    totalTickets: 100,
    collected: 20000,
    goal: 2000,
    winner: '08',
    actions: '',
    photo:
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=400',
  },
  {
    _id: '603d21bf9f8b2c001f8ee3d9',
    title: 'The standard Lorem Ipsum passage',
    foundation: 'CLEAN OCEAN',
    category: 'MEDIO AMBIENTE',
    status: 'FINALIZADA',
    soldTickets: 50,
    totalTickets: 100,
    collected: 20000,
    goal: 2000,
    winner: '08',
    actions: '',
    photo:
      'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?auto=format&fit=crop&q=80&w=400',
  },
  {
    _id: '603d21bf9f8b2c001f8ee3da',
    title: 'The standard Lorem Ipsum passage',
    foundation: 'CLEAN OCEAN',
    category: 'MEDIO AMBIENTE',
    status: 'FINALIZADA',
    soldTickets: 50,
    totalTickets: 100,
    collected: 20000,
    goal: 2000,
    winner: '08',
    actions: '',
    photo:
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=400',
  },
  {
    _id: '603d21bf9f8b2c001f8ee3db',
    title: 'The standard Lorem Ipsum passage',
    foundation: 'CLEAN OCEAN',
    category: 'MEDIO AMBIENTE',
    status: 'FINALIZADA',
    soldTickets: 50,
    totalTickets: 100,
    collected: 20000,
    goal: 2000,
    winner: '08',
    actions: '',
    photo:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=400',
  },
];

export const DEFAULT_RAFFLE_PHOTO = '';
