import { Ticket } from './ticket.interface';

export interface TicketHistoryData {
  winnerName: string;
  ticketsPurchased: number;
  associatedNumbers: string;
  email: string;
  winnerTicket: string;
  phone: string;
  lastPurchaseDate: string;
  tickets: Ticket[];
}
