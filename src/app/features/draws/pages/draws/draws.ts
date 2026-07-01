import { Component, OnInit, inject, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { mapRaffleForTable } from '../../../../core/helpers/ui/utils';
import { Tables } from '../../../../shared/components/tables/tables';
import { EditTicketsModal } from '../../../../shared/components/edit-tickets-modal/edit-tickets-modal';
import { Raffle } from '../../../../core/interfaces/api/raffle.interface';
import { TableColumn } from '../../../../core/interfaces/api/table-column.interface';
import { DrawService } from '../../../../core/services/api/draw.service';

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
  private readonly destroyRef = inject(DestroyRef);

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
    setTimeout(() => {
      this.cargarDatos();
    });
  }

  cargarDatos() {
    this.loading = true;
    this.cdr.detectChanges();
    this.drawService
      .getPendingDraws()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
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
    this.tableData = this.rifasData.map((raffle) => mapRaffleForTable(raffle));
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
  }
}
