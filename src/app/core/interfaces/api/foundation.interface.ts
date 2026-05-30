export interface Foundation {
  _id: string;
  name: string;
  description: string;
  email: string;
  phone: string;
  status: 'ACTIVO' | 'INACTIVO' | 'ELIMINADO';
  actions: string;
  photo?: string;
  deleteReason?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

