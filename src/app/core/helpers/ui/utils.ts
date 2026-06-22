import { Raffle } from '../../interfaces/api/raffle.interface';
import { RaffleDetail } from '../../interfaces/api/raffle-detail.interface';
import { TicketHistoryData } from '../../interfaces/api/ticket-history-data.interface';
import { Ticket } from '../../interfaces/api/ticket.interface';
import {
  DEFAULT_MONEY_GOAL,
  BENEFICIARY_PERCENTAGE,
  WINNER_PERCENTAGE,
  DEFAULT_RAFFLE_PHOTO,
} from '../global/raffle.constants';

export function generateObjectId(): string {
  const timestamp = Math.floor(new Date().getTime() / 1000)
    .toString(16)
    .padStart(8, '0');
  const randomChars = Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join('');
  return timestamp + randomChars;
}

export function parseDateString(dateStr: string): Date | null {
  if (!dateStr) return null;
  try {
    if (dateStr.includes('-')) {
      const parts = dateStr.split('T')[0].split('-');
      const [year, month, day] = parts.map(Number);
      const parsed = new Date(year, month - 1, day);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts[0].length === 4) {
        const [year, month, day] = parts.map(Number);
        const parsed = new Date(year, month - 1, day);
        if (!isNaN(parsed.getTime())) return parsed;
      } else {
        const [day, month, year] = parts.map(Number);
        const parsed = new Date(year, month - 1, day);
        if (!isNaN(parsed.getTime())) return parsed;
      }
    }

    const directDate = new Date(dateStr);
    if (!isNaN(directDate.getTime())) {
      return directDate;
    }
    return null;
  } catch {
    return null;
  }
}

export function calculateRemainingTime(endDateStr: string, status?: string): string {
  const statusUpper = (status || '').toUpperCase();
  if (statusUpper === 'FINISHED' || statusUpper === 'DELETED') {
    return '0 días';
  }

  let end = new Date(endDateStr);
  if (isNaN(end.getTime()) || endDateStr.length <= 10) {
    end = parseDateString(endDateStr) || new Date();
  }

  if (!end || isNaN(end.getTime())) return '0 días';

  try {
    const today = new Date();
    const diffMs = end.getTime() - today.getTime();
    if (diffMs <= 0) return '0 días';

    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 1) {
      const minutes = Math.ceil(diffMs / (1000 * 60));
      return `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
    }

    if (diffHours < 24) {
      const hours = Math.ceil(diffHours);
      return `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    }

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
  } catch {
    return '0 días';
  }
}

export function mapRaffleDetails(raffle: Raffle): RaffleDetail {
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

  const formatDate = (dateVal: Date | string | number | null | undefined) => {
    if (!dateVal) return '';
    try {
      const dateObj = new Date(dateVal);
      if (isNaN(dateObj.getTime())) return String(dateVal);
      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const year = dateObj.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return String(dateVal);
    }
  };

  return {
    name: raffle.title,
    foundation: raffle.foundation,
    startDate: formatDate(raffle.startDate) || '10/05/2026',
    endDate: formatDate(raffle.endDate) || '14/05/2026',
    category: raffle.category,
    ticketPrice: raffle.ticketPrice || 30,
    winningTicket: raffle.winner,
    moneyGoal,
    ticketsSold: raffle.soldTickets,
    ticketsAvailable: raffle.totalTickets,
    totalCollected,
    photo: raffle.photo || DEFAULT_RAFFLE_PHOTO,
    banner: raffle.banner || '',
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
    link: raffle.link || '',
    unlinks: raffle.unlinks || [],
  };
}

export function mapTicketDetails(tickets: Ticket[], raffle: Raffle): TicketHistoryData {
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
    email = buyer.email || email;
    phone = buyer.phone || phone;

    if (buyer.userId) {
      const userTickets = tickets
        .filter((t) => t.buyer && t.buyer.userId === buyer.userId)
        .map((t) => t.number);

      ticketsPurchased = userTickets.length;
      associatedNumbers = userTickets
        .map((num) => parseInt(num, 10))
        .sort((a, b) => a - b)
        .map((num) => `[${num}]`)
        .join(' ');

      const dates = tickets
        .filter((t) => t.buyer && t.buyer.userId === buyer.userId && t.buyer.purchaseDate)
        .map((t) => new Date(t.buyer!.purchaseDate).getTime());

      if (dates.length > 0) {
        const maxDate = new Date(Math.max(...dates));
        lastPurchaseDate = maxDate.toLocaleDateString('es-MX');
      } else {
        lastPurchaseDate = buyer.purchaseDate
          ? new Date(buyer.purchaseDate).toLocaleDateString('es-MX')
          : '';
      }
    } else {
      ticketsPurchased = buyer.tickets ? buyer.tickets.length : 0;
      associatedNumbers = buyer.tickets ? buyer.tickets.map((num) => `[${num}]`).join(' ') : '';
      lastPurchaseDate = buyer.purchaseDate
        ? new Date(buyer.purchaseDate).toLocaleDateString('es-MX')
        : '';
    }
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

export function isActiveStatus(status: string): boolean {
  return (status || '').toUpperCase() === 'ACTIVE';
}

export function isInactiveStatus(status: string): boolean {
  return (status || '').toUpperCase() === 'INACTIVE';
}

export function isDeletedStatus(status: string): boolean {
  return (status || '').toUpperCase() === 'DELETED';
}

/**
 * Decorates a Raffle with the derived columns used by the generic tables:
 * `soldTicketsStr`, `collectedStr`, `remainingTime`, optional `fechaSorteo`,
 * `ganadorText` and a default `drawMethod` if missing. Centralizing this
 * removes four copies of the same mapping across history/my-raffles/draws/dashboard.
 *
 * @param raffle           Source raffle as returned by the backend.
 * @param defaultDrawMethod Fallback when raffle.drawMethod is undefined.
 *                         Defaults to 'AUTOMATIC'.
 */
export function mapRaffleForTable(
  raffle: Raffle,
  defaultDrawMethod: 'AUTOMATIC' | 'MANUAL' = 'AUTOMATIC',
): Raffle & {
  soldTicketsStr: string;
  collectedStr: string;
  remainingTime?: string;
  fechaSorteo?: string;
  ganadorText?: string;
} {
  const collectedStr = raffle.goal
    ? `${raffle.collected}/${raffle.goal} $`
    : `${raffle.collected}$`;

  const soldTicketsStr = `${raffle.soldTickets}/${raffle.totalTickets}`;
  const remainingTime =
    raffle.endDate !== undefined
      ? calculateRemainingTime(raffle.endDate, raffle.status)
      : raffle.remainingTime;

  const fechaSorteo =
    raffle.endDate !== undefined
      ? calculateRemainingTime(raffle.endDate, raffle.status)
      : 'Sin Fecha';

  const ganadorText = raffle.winner
    ? `Boleto ${raffle.winner} (${raffle.winnerName || 'Sin Nombre'})`
    : 'Pendiente Sorteo';

  return {
    ...raffle,
    drawMethod: raffle.drawMethod || defaultDrawMethod,
    soldTicketsStr,
    collectedStr,
    remainingTime,
    fechaSorteo,
    ganadorText,
  };
}
