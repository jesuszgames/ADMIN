import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SimpleCard } from '../../components/simple-card/simple-card';
import { TableColumn, Tables } from '../../../../shared/components/tables/tables';
import { DeleteModal } from '../../../../shared/components/delete-modal/delete-modal';
import {
  HistoryRafflesModal,
  RaffleDetail,
} from '../../../../shared/components/history-raffles-modal/history-raffles-modal';

export type Raffle = {
  id: number;
  nombreRifa: string;
  fundacion: string;
  categoria: string;
  estado: string;
  boletosVendidos: number;
  boletosTotales: number;
  recaudado: number;
  meta: number | null;
  ganador: string;
  acciones: string;
};

@Component({
  selector: 'app-dashboard',
  imports: [SimpleCard, CommonModule, Tables, DeleteModal, HistoryRafflesModal],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  userName = 'Usuario';
  principalHeader = 'Rifas Recientes';
  selectedRaffle: RaffleDetail | null = null;

  protected readonly cards = [
    { label: 'Recaudado', value: '0' },
    { label: 'Beneficiarios', value: '0' },
    { label: 'Ganadores', value: '0' },
    { label: 'Activas', value: '0' },
    { label: 'Sin boletos', value: '0' },
    { label: 'Finalizados', value: '0' },
  ];

  dashboardColumns: TableColumn[] = [
    { field: 'nombreRifa', header: 'Nombre Rifa' },
    { field: 'fundacion', header: 'Fundación' },
    { field: 'categoria', header: 'Categoría' },
    { field: 'estado', header: 'Estado', type: 'badge' },
    { field: 'recaudadoStr', header: 'Total Recaudado' },
    { field: 'ganador', header: 'Boleto Ganador' },
    { field: 'acciones', header: 'Acciones', type: 'actions' },
  ];

  rifaSeleccionadaParaBorrar: Raffle | null = null;
  rifaSeleccionadaParaVer: Raffle | null = null;

  manejarAccion(evento: { actionId: number; row: any }) {
    if (evento.actionId === 1) {
      this.rifaSeleccionadaParaVer = evento.row;
      this.onViewDetails(evento.row);
      document.getElementById('btn-abrir-modal-history')?.click();
    } else if (evento.actionId === 3) {
      this.rifaSeleccionadaParaBorrar = evento.row;
      document.getElementById('btn-abrir-modal-delete')?.click();
    }
  }

  onViewDetails(raffle: any) {
    const totalCollected = raffle.recaudado;
    const moneyGoal = raffle.meta || 3000;

    const beneficiaryPercentage = 80;
    const winnerPercentage = 20;
    const beneficiaryAmount = (totalCollected * beneficiaryPercentage) / 100;
    const winnerAmount = (totalCollected * winnerPercentage) / 100;

    this.selectedRaffle = {
      name: raffle.nombreRifa,
      foundation: raffle.fundacion,
      startDate: '10/05/2026',
      endDate: '14/05/2026',
      category: raffle.categoria,
      ticketPrice: 30,
      winningTicket: raffle.ganador,
      moneyGoal: moneyGoal,
      ticketsSold: raffle.boletosVendidos,
      ticketsAvailable: raffle.boletosTotales,
      totalCollected: totalCollected,
      photo:
        'data:image/jpeg;base64,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',
      beneficiaryAmount,
      beneficiaryPercentage,
      winnerAmount,
      winnerPercentage,
      blogCardText: 'Ayuda a reforestar 10,000 hectáreas en el Amazonas.',
      blogDetailText:
        'Detalle completo de la rifa se muestra aquí...\nPuedes añadir toda la información detallada que necesites sobre los premios, mecánicas y condiciones de participación de la rifa en esta sección interactiva.',
    };
  }

  recentRaffles: Raffle[] = [
    {
      id: 1,
      nombreRifa: 'translation by H. Rackham',
      fundacion: 'COMPU TRON',
      categoria: 'TECNOLOGIA',
      estado: 'FINALIZADO',
      boletosVendidos: 100,
      boletosTotales: 100,
      recaudado: 13000,
      meta: 20000,
      ganador: '07',
      acciones: '',
    },
    {
      id: 2,
      nombreRifa: 'The standard Lorem Ipsum passage',
      fundacion: 'CLEAN OCEAN',
      categoria: 'MEDIO AMBIENTE',
      estado: 'FINALIZADA',
      boletosVendidos: 50,
      boletosTotales: 100,
      recaudado: 20000,
      meta: 2000,
      ganador: '08',
      acciones: '',
    },
    {
      id: 3,
      nombreRifa: 'The standard Lorem Ipsum passage',
      fundacion: 'CLEAN OCEAN',
      categoria: 'MEDIO AMBIENTE',
      estado: 'FINALIZADA',
      boletosVendidos: 50,
      boletosTotales: 100,
      recaudado: 20000,
      meta: 2000,
      ganador: '08',
      acciones: '',
    },
    {
      id: 4,
      nombreRifa: 'The standard Lorem Ipsum passage',
      fundacion: 'CLEAN OCEAN',
      categoria: 'MEDIO AMBIENTE',
      estado: 'FINALIZADA',
      boletosVendidos: 50,
      boletosTotales: 100,
      recaudado: 20000,
      meta: 2000,
      ganador: '08',
      acciones: '',
    },
    {
      id: 5,
      nombreRifa: 'The standard Lorem Ipsum passage',
      fundacion: 'CLEAN OCEAN',
      categoria: 'MEDIO AMBIENTE',
      estado: 'FINALIZADA',
      boletosVendidos: 50,
      boletosTotales: 100,
      recaudado: 20000,
      meta: 2000,
      ganador: '08',
      acciones: '',
    },
    {
      id: 6,
      nombreRifa: 'The standard Lorem Ipsum passage',
      fundacion: 'CLEAN OCEAN',
      categoria: 'MEDIO AMBIENTE',
      estado: 'FINALIZADA',
      boletosVendidos: 50,
      boletosTotales: 100,
      recaudado: 20000,
      meta: 2000,
      ganador: '08',
      acciones: '',
    },
    {
      id: 7,
      nombreRifa: 'The standard Lorem Ipsum passage',
      fundacion: 'CLEAN OCEAN',
      categoria: 'MEDIO AMBIENTE',
      estado: 'FINALIZADA',
      boletosVendidos: 50,
      boletosTotales: 100,
      recaudado: 20000,
      meta: 2000,
      ganador: '08',
      acciones: '',
    },
    {
      id: 8,
      nombreRifa: 'The standard Lorem Ipsum passage',
      fundacion: 'CLEAN OCEAN',
      categoria: 'MEDIO AMBIENTE',
      estado: 'FINALIZADA',
      boletosVendidos: 50,
      boletosTotales: 100,
      recaudado: 20000,
      meta: 2000,
      ganador: '08',
      acciones: '',
    },
    {
      id: 9,
      nombreRifa: 'The standard Lorem Ipsum passage',
      fundacion: 'CLEAN OCEAN',
      categoria: 'MEDIO AMBIENTE',
      estado: 'FINALIZADA',
      boletosVendidos: 50,
      boletosTotales: 100,
      recaudado: 20000,
      meta: 2000,
      ganador: '08',
      acciones: '',
    },
    {
      id: 10,
      nombreRifa: 'The standard Lorem Ipsum passage',
      fundacion: 'CLEAN OCEAN',
      categoria: 'MEDIO AMBIENTE',
      estado: 'FINALIZADA',
      boletosVendidos: 50,
      boletosTotales: 100,
      recaudado: 20000,
      meta: 2000,
      ganador: '08',
      acciones: '',
    },
    {
      id: 11,
      nombreRifa: 'The standard Lorem Ipsum passage',
      fundacion: 'CLEAN OCEAN',
      categoria: 'MEDIO AMBIENTE',
      estado: 'FINALIZADA',
      boletosVendidos: 50,
      boletosTotales: 100,
      recaudado: 20000,
      meta: 2000,
      ganador: '08',
      acciones: '',
    },
  ];

  tableData = this.recentRaffles.map((raffle) => ({
    ...raffle,
    recaudadoStr: raffle.meta ? `${raffle.recaudado}/${raffle.meta} $` : `${raffle.recaudado}$`,
  }));
}
