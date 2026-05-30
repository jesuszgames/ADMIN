import { Ticket } from './ticket.interface';

export interface Raffle {
  _id: string;
  title: string;
  foundation: string;
  foundationId?: string;
  category: string;
  categoryId?: string;
  status: 'BORRADOR' | 'ACTIVA' | 'FINALIZADA' | 'ELIMINADA' | string; // Keep string for dynamic display statuses in component mappings
  soldTickets: number;
  totalTickets: number;
  collected: number;
  goal: number | null;
  winner: string;
  winnerId?: string;
  winnerName?: string;
  winnerEmail?: string;
  winnerPhone?: string;
  remainingTime?: string;
  actions: string;
  soldTicketsStr?: string;
  collectedStr?: string;
  ticketPrice?: number;
  startDate?: string;
  endDate?: string;
  beneficiaryPercentage?: number;
  winnerPercentage?: number;
  blogCardText?: string;
  blogDetailText?: string;
  photo?: string;
  tickets?: Ticket[];
  associatedNumbers?: string;
  drawMethod?: 'AUTOMATICO' | 'MANUAL';
  deleteReason?: string;
  unlinks?: UnlinkLog[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface UnlinkLog {
  number: string;
  user: string;
  purchaseId: string;
  reason: string;
  date: string;
}


