import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface FilterOption {
  id: string;
  icon: string;
  label: string;
}

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter.html',
  styleUrl: './filter.scss',
})
export class Filter {
  @Input() options: FilterOption[] = [];

  @Output() onFilter = new EventEmitter<string>();

  filtroSeleccionado = signal<string>('all');

  seleccionarFiltro(id: string) {
    this.filtroSeleccionado.set(id);
    this.onFilter.emit(id);
  }
}
