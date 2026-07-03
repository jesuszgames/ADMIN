export interface Foundation {
  _id: string;
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  actions?: string;
  photo?: string | Blob | File | null;
  deleteReason?: string;
  balance?: number;
  balanceFormatted?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

