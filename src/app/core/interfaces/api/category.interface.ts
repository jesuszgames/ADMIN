export interface Category {
  _id: string;
  name: string;
  description: string;
  icon: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  actions: string;
  deleteReason?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface IconOption {
  value: string;
  label: string;
}

