import { UnlinkLog } from './raffle.interface';

export interface RaffleDetail {
  name: string;
  foundation: string;
  startDate: string;
  endDate: string;
  category: string;
  ticketPrice: number;
  winningTicket: string;
  moneyGoal: number;
  ticketsSold: number;
  ticketsAvailable: number;
  totalCollected: number;
  photo: string;
  beneficiaryAmount: number;
  beneficiaryPercentage: number;
  winnerAmount: number;
  winnerPercentage: number;
  blogCardText: string;
  blogDetailText: string;
  drawMethod?: 'AUTOMATICO' | 'MANUAL';
  deleteReason?: string;
  unlinks?: UnlinkLog[];
}
