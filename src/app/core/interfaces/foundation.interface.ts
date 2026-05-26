export interface Foundation {
  id: number;
  nombre: string;
  descripcion: string;
  correo: string;
  telefono: string;
  estado: string;
  acciones: string;
  photo?: string;
  [key: string]: unknown;
}
