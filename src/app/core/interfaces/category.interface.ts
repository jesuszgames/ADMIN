export interface Category {
  id: number;
  nombre: string;
  descripcion: string;
  icon: string;
  estado: string;
  acciones: string;
  [key: string]: unknown;
}

export interface IconOption {
  value: string;
  label: string;
}
