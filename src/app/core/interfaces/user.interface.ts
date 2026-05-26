export interface User {
  id: number;
  nombre: string;
  correo: string;
  telefono: string;
  estado: 'ACTIVO' | 'INACTIVO';
  acciones: string;
  [key: string]: unknown;
}
