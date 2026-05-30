export interface BuyerInfo {
  id: string; // purchaseId in frontend
  purchaseId?: string; // matches backend
  userId?: string; // Ref to User (if registered)
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

