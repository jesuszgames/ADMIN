import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Filter } from '../../../../shared/components/filter/filter';
import { Tables } from '../../../../shared/components/tables/tables';
import { EditTicketsModal } from '../../../../shared/components/edit-tickets-modal/edit-tickets-modal';
import { Raffle } from '../../../../core/interfaces/api/raffle.interface';
import { FilterOption } from '../../../../core/interfaces/api/filter-option.interface';
import { TableColumn } from '../../../../core/interfaces/api/table-column.interface';
import { RaffleService } from '../../../../core/services/api/raffle.service';
import {
  METHOD_AUTOMATIC,
  STATE_DELETED,
} from '../../../../core/helpers/global/raffle.constants';

@Component({
  selector: 'app-draws',
  standalone: true,
  imports: [CommonModule, FormsModule, Filter, Tables, EditTicketsModal],
  templateUrl: './draws.html',
  styleUrl: './draws.scss',
})
export class Draws implements OnInit {
  private readonly raffleService = inject(RaffleService);

  principalHeader = 'Sorteos de Rifas';

  columns: TableColumn[] = [
    { field: 'title', header: 'Nombre Rifa' },
    { field: 'foundation', header: 'Fundación' },
    { field: 'category', header: 'Categoría' },
    { field: 'soldTicketsStr', header: 'Boletos Vendidos' },
    { field: 'drawMethod', header: 'Sorteo', type: 'badge' },
    { field: 'status', header: 'Estado', type: 'badge' },
    { field: 'ganadorText', header: 'Boleto Ganador' },
    { field: 'actions', header: 'Acciones', type: 'actions' },
  ];

  filters: FilterOption[] = [
    { id: 'all', icon: 'bi-list-ul', label: 'Todo' },
    { id: 'active', icon: 'bi-play-circle', label: 'Activas (Pendientes)' },
    { id: 'finished', icon: 'bi-check-circle', label: 'Finalizadas' },
  ];

  filtroActual = 'all';
  selectedRaffleForTickets: Raffle | null = null;

  rifasData: Raffle[] = [];
  tableData: Raffle[] = [];

  rowActions = [
    { id: 1, icon: 'bi-trophy', label: 'Realizar Sorteo' }
  ];

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    this.raffleService.getAll().subscribe({
      next: (res) => {
        if (res && res.data) {
          this.rifasData = res.data;
          this.updateTableData();
        }
      },
      error: (err) => {
        console.error('API Error: No se pudieron cargar las rifas para sorteo.', err);
      }
    });
  }

  filtrar(id: string) {
    this.filtroActual = id;
    this.updateTableData();
  }

  updateTableData() {
    let filtered = this.rifasData.filter((r) => r.status !== STATE_DELETED && r.drawMethod === 'MANUAL');

    if (this.filtroActual === 'active') {
      filtered = filtered.filter((r) => r.status === 'ACTIVO' || r.status === 'ACTIVA' || !r.winner);
    } else if (this.filtroActual === 'finished') {
      filtered = filtered.filter((r) => r.status === 'FINALIZADO' || r.status === 'FINALIZADA' || !!r.winner);
    }

    this.tableData = filtered.map((raffle) => {
      let recStr = `${raffle.collected}$`;
      try {
        if (!raffle.goal) throw new Error();
        recStr = `${raffle.collected}/${raffle.goal} $`;
      } catch { }

      return {
        ...raffle,
        drawMethod: raffle.drawMethod || (METHOD_AUTOMATIC as 'AUTOMATICO' | 'MANUAL'),
        soldTicketsStr: `${raffle.soldTickets}/${raffle.totalTickets}`,
        collectedStr: recStr,
        ganadorText: raffle.winner ? `Boleto ${raffle.winner} (${raffle.winnerName || 'Sin Nombre'})` : 'Pendiente Sorteo',
      };
    });
  }

  manejarAccion(evento: { actionId: number; row: Record<string, unknown> }) {
    const row = evento.row as unknown as Raffle;
    if (evento.actionId === 1) {
      this.selectedRaffleForTickets = this.rifasData.find((r) => r._id === row._id) || null;
      if (this.selectedRaffleForTickets) {
        document.getElementById('btn-abrir-modal-edit-tickets')?.click();
      }
    }
  }

  onSaveTickets(updatedRaffle: Raffle) {
    this.cargarDatos();
    this.selectedRaffleForTickets = null;
  }
}
