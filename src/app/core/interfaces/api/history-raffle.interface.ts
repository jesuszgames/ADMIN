import { Raffle } from './raffle.interface';

export interface HistoryRaffle extends Raffle {
  goal: number;
}
