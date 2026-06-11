import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { calculateRemainingTime } from '../../../../core/helpers/ui/utils';
import { Tables } from '../../../../shared/components/tables/tables';
import { EditTicketsModal } from '../../../../shared/components/edit-tickets-modal/edit-tickets-modal';
import { Raffle } from '../../../../core/interfaces/api/raffle.interface';
import { TableColumn } from '../../../../core/interfaces/api/table-column.interface';
import { DrawService } from '../../../../core/services/api/draw.service';
import { METHOD_AUTOMATIC } from '../../../../core/helpers/global/raffle.constants';

@Component({
  selector: 'app-draws',
  standalone: true,
  imports: [CommonModule, FormsModule, Tables, EditTicketsModal],
  templateUrl: './draws.html',
  styleUrl: './draws.scss',
})
export class Draws implements OnInit {
  private readonly drawService = inject(DrawService);
  private readonly cdr = inject(ChangeDetectorRef);

  principalHeader = 'Sorteos de Rifas';

  columns: TableColumn[] = [
    { field: 'title', header: 'Nombre Rifa' },
    { field: 'foundation', header: 'Fundación' },
    { field: 'category', header: 'Categoría' },
    { field: 'soldTicketsStr', header: 'Boletos Vendidos' },
    { field: 'drawMethod', header: 'Sorteo', type: 'badge' },
    { field: 'status', header: 'Estado', type: 'badge' },
    { field: 'fechaSorteo', header: 'Tiempo Restante' },
    { field: 'ganadorText', header: 'Boleto Ganador' },
    { field: 'actions', header: 'Acciones', type: 'actions' },
  ];

  selectedRaffleForTickets: Raffle | null = null;

  rifasData: Raffle[] = [];
  tableData: Raffle[] = [];
  loading = false;

  rowActions = [{ id: 1, icon: 'bi-trophy', label: 'Realizar Sorteo' }];

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    this.loading = true;
    this.cdr.detectChanges();
    this.drawService.getPendingDraws().subscribe({
      next: (res) => {
        if (res && res.data) {
          this.rifasData = res.data;
          this.updateTableData();
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('API Error: No se pudieron cargar las rifas para sorteo.', err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  updateTableData() {
    this.tableData = this.rifasData.map((raffle) => {
      let recStr = `${raffle.collected}$`;
      try {
        if (!raffle.goal) throw new Error();
        recStr = `${raffle.collected}/${raffle.goal} $`;
      } catch {}

      let fechaSorteo = 'Sin Fecha';
      if (raffle.endDate) {
        fechaSorteo = calculateRemainingTime(raffle.endDate, raffle.status);
      }

      return {
        ...raffle,
        drawMethod: raffle.drawMethod || (METHOD_AUTOMATIC as 'AUTOMATIC' | 'MANUAL'),
        soldTicketsStr: `${raffle.soldTickets}/${raffle.totalTickets}`,
        collectedStr: recStr,
        fechaSorteo,
        ganadorText: raffle.winner
          ? `Boleto ${raffle.winner} (${raffle.winnerName || 'Sin Nombre'})`
          : 'Pendiente Sorteo',
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

  onSaveTickets(_updatedRaffle: Raffle) {
    this.cargarDatos();
    this.selectedRaffleForTickets = null;
  }
}
