export interface BuyerInfo {
  id: string;
  nombre: string;
  correo: string;
  telefono: string;
  fechaCompra: string;
  boletos: string[];
}

export interface Ticket {
  numero: string;
  estado: 'disponible' | 'seleccionado' | 'ganador';
  buyer?: BuyerInfo;
}
