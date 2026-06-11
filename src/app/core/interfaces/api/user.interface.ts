export interface User {
  _id: string;
  username?: string;
  name: string;
  email: string;
  phone: string;
  role?: 'ADMIN' | 'SORTEADOR' | 'USUARIO';
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  actions: string;
  deleteReason?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}
