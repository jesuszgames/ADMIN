import { Ticket } from './ticket.interface';

export interface Raffle {
  id: number;
  nombreRifa: string;
  fundacion: string;
  categoria: string;
  estado: string;
  boletosVendidos: number;
  boletosTotales: number;
  recaudado: number;
  meta: number | null;
  ganador: string;
  ganadorName?: string;
  ganadorEmail?: string;
  ganadorPhone?: string;
  tiempoRestante?: string;
  acciones: string;
  boletosVendidosStr?: string;
  recaudadoStr?: string;
  ticketPrice?: number;
  startDate?: string;
  endDate?: string;
  beneficiaryPercentage?: number;
  winnerPercentage?: number;
  blogCardText?: string;
  blogDetailText?: string;
  photo?: string;
  boletos?: Ticket[];
  numerosAsociados?: string;
  [key: string]: unknown;
}
