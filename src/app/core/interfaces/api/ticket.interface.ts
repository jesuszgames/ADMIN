export interface BuyerInfo {
  id: string;
  purchaseId?: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  purchaseDate: string;
  tickets: string[];
}

export interface Ticket {
  _id?: string;
  number: string;
  status: 'available' | 'selected' | 'winner';
  buyer?: BuyerInfo;
}
