export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role?: 'ADMIN' | 'SORTEADOR' | 'USUARIO';
  status: 'ACTIVO' | 'INACTIVO' | 'ELIMINADO';
  actions: string;
  deleteReason?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

