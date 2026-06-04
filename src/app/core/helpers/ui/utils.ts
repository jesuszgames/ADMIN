import { RaffleDetail } from '../../interfaces/api/raffle-detail.interface';
import { TicketHistoryData } from '../../interfaces/api/ticket-history-data.interface';
import { Ticket } from '../../interfaces/api/ticket.interface';
import {
  DEFAULT_MONEY_GOAL,
  BENEFICIARY_PERCENTAGE,
  WINNER_PERCENTAGE,
  DEFAULT_RAFFLE_PHOTO,
} from '../global/dashboard.constants';

export function generateObjectId(): string {
  const timestamp = Math.floor(new Date().getTime() / 1000).toString(16).padStart(8, '0');
  const randomChars = Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  return timestamp + randomChars;
}

export function parseDateString(dateStr: string): Date | null {
  if (!dateStr) return null;
  try {
    if (dateStr.includes('-')) {
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts[0].length === 4) {
        const [year, month, day] = parts.map(Number);
        return new Date(year, month - 1, day);
      } else {
        const [day, month, year] = parts.map(Number);
        return new Date(year, month - 1, day);
      }
    }
    return new Date(dateStr);
  } catch {
    return null;
  }
}

export function calculateRemainingTime(endDateStr: string, status?: string): string {
  const statusUpper = (status || '').toUpperCase();
  if (
    statusUpper === 'FINISHED' ||
    statusUpper === 'FINALIZADO' ||
    statusUpper === 'FINALIZADA' ||
    statusUpper === 'DELETED' ||
    statusUpper === 'ELIMINADO' ||
    statusUpper === 'ELIMINADA'
  ) {
    return '0 días';
  }
  const end = parseDateString(endDateStr);
  if (!end) return '0 días';

  try {
    const today = new Date();
    end.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffDays = Math.round((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return '0 días';
    if (diffDays === 0) return `${24 - new Date().getHours()} horas`;
    if (diffDays === 1) return '1 día';
    return `${diffDays} días`;
  } catch {
    return '';
  }
}

export function mapRaffleDetails(raffle: any): RaffleDetail {
  const totalCollected = raffle.collected || 0;
  const moneyGoal = raffle.goal || DEFAULT_MONEY_GOAL;
  const beneficiaryPercentage =
    raffle.beneficiaryPercentage !== undefined
      ? raffle.beneficiaryPercentage
      : BENEFICIARY_PERCENTAGE;
  const winnerPercentage =
    raffle.winnerPercentage !== undefined ? raffle.winnerPercentage : WINNER_PERCENTAGE;

  const beneficiaryAmount = (totalCollected * beneficiaryPercentage) / 100;
  const winnerAmount = (totalCollected * winnerPercentage) / 100;

  return {
    name: raffle.title,
    foundation: raffle.foundation,
    startDate: raffle.startDate || '10/05/2026',
    endDate: raffle.endDate || '14/05/2026',
    category: raffle.category,
    ticketPrice: raffle.ticketPrice || 30,
    winningTicket: raffle.winner,
    moneyGoal,
    ticketsSold: raffle.soldTickets,
    ticketsAvailable: raffle.totalTickets,
    totalCollected,
    photo: raffle.photo || DEFAULT_RAFFLE_PHOTO,
    beneficiaryAmount,
    beneficiaryPercentage,
    winnerAmount,
    winnerPercentage,
    blogCardText: raffle.blogCardText || 'Ayuda a reforestar 10,000 hectáreas en el Amazonas.',
    blogDetailText:
      raffle.blogDetailText ||
      'Detalle completo de la rifa se muestra aquí...\nPuedes añadir toda la información detallada que necesites sobre los premios, mecánicas y condiciones de participación de la rifa en esta sección interactiva.',
    drawMethod: raffle.drawMethod,
    deleteReason: raffle.deleteReason || '',
    unlinks: raffle.unlinks || [],
  };
}

export function mapTicketDetails(tickets: Ticket[], raffle: any): TicketHistoryData {
  const winnerTicketObj = tickets.find((t) => t.status === 'winner');
  const firstBuyerTicket = tickets.find((t) => t.buyer);
  const representativeTicket = winnerTicketObj || firstBuyerTicket;

  let winnerName = raffle.winnerName || '';
  let ticketsPurchased = 0;
  let associatedNumbers = '';
  let email = raffle.winnerEmail || '';
  let phone = raffle.winnerPhone || '';
  let lastPurchaseDate = '';

  if (representativeTicket && representativeTicket.buyer) {
    const buyer = representativeTicket.buyer;
    winnerName = buyer.name || winnerName;
    ticketsPurchased = buyer.tickets ? buyer.tickets.length : 0;
    associatedNumbers = buyer.tickets ? buyer.tickets.map((num) => `[${num}]`).join(' ') : '';
    email = buyer.email || email;
    phone = buyer.phone || phone;
    lastPurchaseDate = buyer.purchaseDate
      ? new Date(buyer.purchaseDate).toLocaleDateString('es-MX')
      : '';
  }

  return {
    winnerName,
    ticketsPurchased,
    associatedNumbers,
    email,
    winnerTicket: raffle.winner || (winnerTicketObj ? winnerTicketObj.number : ''),
    phone,
    lastPurchaseDate,
    tickets,
  };
}
